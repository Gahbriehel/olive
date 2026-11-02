# WhatsApp Outreach & Messaging Settings: Admin Implementation Guide

This guide is the Olive (`apps/admin`, plus a small `apps/web` change) side of Dove's
`docs/PHASE2_MESSAGING_AND_PROFILE_IMPLEMENTATION.md` (Part B). Read that guide first. It defines the data,
the endpoints and the decisions (Dove ADR-006).

**What we're building:** staff send birthday, visitor follow-up and pastoral care messages from the church
WhatsApp Business number. Olive asks Dove to compose a personalised message, opens WhatsApp with it
pre-filled, then asks the admin whether they actually sent it. Nothing is sent automatically, and nothing costs money per message.

Existing conventions apply: services in `src/services` (`apiClient` + `extractData`), React Query hooks in
`src/hooks`, models in `src/models`, `react-hook-form` + `yup`, `react-hot-toast`, and the `components/ui` primitives.

---

## 0. Prerequisites in Dove

| Olive section | Needs Dove |
|---|---|
| 2, 3, 4 | B1 phone normalisation, B2 identity fields, B4 templates, B5/B7 outreach endpoints |
| 5 | B8 `GET /outreach/today` |
| 6 | B9 `GET /people/:id/messages` |
| 3.1 | B10 birthday per channel (`whatsappGreeting`, `greetedChannels`) |
| 7 | B2, B4, B6 |

---

## 1. Data layer

**`src/models/outreach.ts`**
```ts
export type MessageChannel = "EMAIL" | "WHATSAPP";
export type OutreachPurpose = "BIRTHDAY" | "VISITOR_FOLLOW_UP" | "PASTORAL_CHECK_IN";
export type OutreachStatus = "OPENED" | "CONFIRMED_SENT" | "NOT_SENT";
export type OutreachWarning =
  | "NO_PHONE" | "INVALID_PHONE" | "WHATSAPP_OPT_OUT" | "NO_TEMPLATE"
  | "ALREADY_GREETED_THIS_YEAR" | "CONTACTED_RECENTLY";

export interface OutreachPreviewRequest {
  personId: string;
  purpose: OutreachPurpose;
  checkInId?: string;
  templateId?: string;
}

export interface OutreachPreview {
  person: { id: string; firstName: string; lastName: string };
  toPhone: string | null;        // E.164
  whatsappDigits: string | null; // no "+"
  template: { id: string; name: string } | null;
  alternatives: { id: string; name: string }[];
  body: string;
  lastOutreach: { at: string; by: string; purpose: OutreachPurpose } | null;
  warnings: OutreachWarning[];
}

export interface OutreachMessage {
  id: string;
  personId: string;
  purpose: OutreachPurpose;
  status: OutreachStatus;
  body: string;
  toPhone: string;
  openedAt: string;
  confirmedAt: string | null;
  checkInId: string | null;
  sentBy: { id: string; name: string };
  person?: { id: string; firstName: string; lastName: string };
}

export interface MessageTemplate {
  id: string;
  channel: MessageChannel;
  purpose: OutreachPurpose;
  checkInReason: CheckInReason | null;
  name: string;
  body: string;
  isActive: boolean;
}
```

**Also add:**

| File | Contents |
|---|---|
| `src/services/outreach.service.ts` | `preview`, `open` (POST `/outreach/whatsapp`), `confirm`, `list`, `today`, `personMessages` |
| `src/services/messageTemplate.service.ts` | `list`, `create`, `update`, `remove`, `previewBody` |
| `src/hooks/useOutreach.ts` | Queries and mutations for the above |
| `src/hooks/useMessageTemplates.ts` | Queries and mutations for templates |

After a confirm, **invalidate**:
- `["outreach-today"]`, `["outreach"]`, `["person-messages", personId]`
- The person query, the birthdays and birthday-analytics queries, and the check-ins queries

Update the person model with `whatsappOptOut` and `whatsappOptOutAt`. Update the user and church settings models with `displayName`, `shortName` and `whatsappNumber`. Update the birthday models with `whatsappGreeting` and `greetedChannels`.

---

## 2. Opening WhatsApp: `src/utils/whatsapp.ts`

The main risk is an admin who has their **personal** WhatsApp and the **church** WhatsApp Business on the same
phone, and accidentally sends from their personal number. The link we build depends on the device:

```ts
export type WhatsAppTarget = "web" | "android-business" | "universal";

export function detectWhatsAppTarget(pref: "auto" | WhatsAppTarget = "auto"): WhatsAppTarget {
  if (pref !== "auto") return pref;
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return "android-business";
  if (/iPhone|iPod/i.test(ua)) return "universal";
  return "web"; // desktop, and iPad (which reports a desktop UA)
}

export function buildWhatsAppUrl(digits: string, text: string, target: WhatsAppTarget): string {
  const t = encodeURIComponent(text);
  switch (target) {
    case "web":
      // Opens only the WhatsApp Web session, which is logged into the church number.
      return `https://web.whatsapp.com/send?phone=${digits}&text=${t}`;
    case "android-business": {
      // Forces the WhatsApp Business app (com.whatsapp.w4b); falls back to wa.me if it isn't installed.
      const fallback = encodeURIComponent(`https://wa.me/${digits}?text=${t}`);
      return `intent://send/?phone=${digits}&text=${t}#Intent;scheme=whatsapp;package=com.whatsapp.w4b;S.browser_fallback_url=${fallback};end`;
    }
    case "universal":
      // iOS can't target a specific app. The UI shows a strong "check the account" warning.
      return `https://wa.me/${digits}?text=${t}`;
  }
}
```

- **Test the Android intent link on a real phone that has both apps.** Don't sign off this feature from desktop emulation.
- **The admin's preference** ("Open WhatsApp in: Automatic / WhatsApp Web / Phone app") lives in `PreferencesSection` and is
  stored in `localStorage` (wrap reads and writes in try/catch). It's a per-device convenience, not server data.
- **Brand icon:** `lucide-react` has no WhatsApp brand icon. Add `components/ui/icons/WhatsAppIcon.tsx` (inline SVG, `currentColor`).

---

## 3. The compose modal: `components/modals/WhatsAppComposeModal.tsx`

One modal used from every entry point.

```ts
interface WhatsAppComposeModalProps {
  open: boolean;
  onClose: () => void;
  personId: string;
  purpose: OutreachPurpose;
  checkInId?: string;
  onConfirmedSent?: (message: OutreachMessage) => void; // e.g. offer "complete check-in"
}
```

### Step 1: Review

When the modal opens, call `POST /outreach/whatsapp/preview`. Show a loading skeleton while it loads.

The modal contains:
- **Recipient:** name and the phone number formatted for display (`+234 803 456 7890`).
- **Template picker:** the current template plus `alternatives` as a select. Changing it calls preview again with `templateId`.
  If the admin has edited the text, ask "Replace your edits?" first.
- **Message:** an editable textarea with the composed `body`, a character count (max 1,000), and a "Reset to template" link.
- **"Sending as" note:**
  - Always shown: "Make sure you're sending from **{churchShortName}**'s WhatsApp."
  - On target `universal` (iPhone), it becomes a highlighted callout: "If you have more than one WhatsApp on this phone, check you're in the church account before you send."
- **`lastOutreach` line:** e.g. "Last contacted 12 Oct by Sis. Grace (check-in)". Shown when present.
- **Warnings**, mapped to friendly text:

| Code | UI |
|---|---|
| `NO_PHONE` / `INVALID_PHONE` | Blocking: "No valid phone number for Sarah." [Edit person]. For birthdays, also show [Send email instead], which opens the existing `SendBirthdayEmailModal`. |
| `WHATSAPP_OPT_OUT` | Blocking: "Sarah asked not to be messaged on WhatsApp." |
| `NO_TEMPLATE` | Blocking for non-admins. Admins get a link to Settings → Message templates. |
| `ALREADY_GREETED_THIS_YEAR` | Non-blocking: "Sarah already got a WhatsApp birthday message this year." |
| `CONTACTED_RECENTLY` | Non-blocking: "Sarah was contacted in the last 3 days." |

**The primary action is a real `<a>`, not a button that calls `window.open` after an `await`.** Opening a window after an `await` gets blocked as a popup:

```tsx
<a
  href={buildWhatsAppUrl(preview.whatsappDigits!, body, target)}
  target="_blank"
  rel="noopener noreferrer"
  onClick={() => openMutation.mutate({ personId, purpose, checkInId, templateId, body })}
>
  Open WhatsApp
</a>
```

Disable the link (`aria-disabled`, no `href`) while there is a blocking warning or the text is empty.

### Step 2: Confirm

As soon as the link is clicked, the modal switches to:

> **Did you send the message to Sarah?**
> [Yes, I sent it] [No, I didn't send it]
> [Open WhatsApp again] (secondary; re-opens the same link without creating a new log)

- **Yes** → `PATCH /outreach/:id/confirm { sent: true }` → toast "Marked as sent" → `onConfirmedSent` → close.
- **No** → `{ sent: false }` → close.
- **Closing without answering** leaves the record `OPENED`. It then appears under "Waiting for you to confirm" (section 5), so nothing is lost.

**If the open-log call fails**, the admin may already be in WhatsApp. Show an inline error with a retry. Don't block the confirm step.

---

## 4. Entry points

**A reusable trigger:** `components/ui/WhatsAppButton.tsx`, a small outline button or icon button with the WhatsApp icon.
It takes `{ personId, purpose, checkInId?, size?, label? }` and owns the modal's open state.

| # | Where | Purpose | Notes |
|---|---|---|---|
| 4.1 | `/reports/birthdays`: row actions in `useBirthdayColumns.tsx` | `BIRTHDAY` | Next to the existing email action. See 4.1 below. |
| 4.2 | Dashboard `UpcomingBirthdaysCard` | `BIRTHDAY` | Icon button on people whose birthday is **today** |
| 4.3 | `GlobalCheckInQueue`: each task | `PASTORAL_CHECK_IN` + `checkInId` | After a confirmed send, ask "Mark this check-in as complete?" → opens the existing `CompleteCheckInModal` |
| 4.4 | `PersonPastoralCareTab`: each scheduled check-in | `PASTORAL_CHECK_IN` + `checkInId` | Same follow-on as 4.3 |
| 4.5 | `PersonDetailPanel` header, next to Edit | `VISITOR_FOLLOW_UP` for visitors, otherwise `PASTORAL_CHECK_IN` (general) | Hidden when the person has no phone |
| 4.6 | `/people` row actions when the follow-up filter is active | `VISITOR_FOLLOW_UP` | |

### 4.1 Changes to the birthday report

- **Status column:** two small badges, Email ✓ and WhatsApp ✓, driven by `greetedChannels`.
- **New filter** `greeted` (`any | email | whatsapp | none`), alongside the existing status filter.
- **`ViewBirthdayGreetingModal`:** show the email greeting (as now) and the WhatsApp greeting (body, sent by, time).
- **`BirthdayKpis`:** add "WhatsApp sent", and change the headline from "Greeted" to "Greeted (any channel)".

---

## 5. Dashboard: "Today's outreach" card

`components/dashboard/TodaysOutreachCard.tsx`, fed by `GET /outreach/today`. Four compact groups, each hidden when empty:

1. **🎂 Birthdays today:** name, "email sent" chip when `emailGreeted`, and a WhatsApp button.
2. **🙏 Check-ins due:** reason badge (using `CHECK_IN_REASONS`), "assigned to me" first, and a WhatsApp button.
3. **👋 Visitors to follow up:** visitor name, "first seen 3 days ago", and a WhatsApp button.
4. **⏳ Waiting for you to confirm:** "You opened a message to Sarah 2 hours ago. Did you send it?" with Yes/No buttons inline.

Each group has a "View all" link: the birthday report, the check-in queue, people filtered by follow-up, and the WhatsApp log.

---

## 6. Message history

- **New `PersonMessagesTab`** in `PersonDetailTabs`, added to `drawerTabs` in `PersonDetailPanel`. It lists `GET /people/:id/messages`, newest first, with a channel icon, purpose, who sent it, when, the status, and a 140-character preview. `OPENED` rows show a "Confirm" action.
- **Messaging Center gets a "WhatsApp log" tab** listing `GET /outreach`. Filters: purpose, status, sent by, date range, matching the existing filter UI. The existing email logs remain the default tab.

---

## 7. Settings

**7.1 My Profile (`ProfileSection`)**
- Add a **"Display name in messages"** field (optional, max 100), with the placeholder "e.g. Pastor John, Sis. Grace".
- Live hint: _Messages will say: "I'm **Pastor John** from Amazing Grace"_. It falls back to the first name when the field is empty.

**7.2 Church Information (`ChurchInfoSection`)**, admin only
- **Short name used in messages:** max 50, e.g. "Amazing Grace".
- **Church WhatsApp number:** phone input that defaults to +234 and shows the normalised value. Add a **"Test"** link that opens `https://wa.me/<digits>` so the admin can check it's the right account.
- Make sure the church name is set to **"Abiding Word Of Grace Missions"**.

**7.3 New tab: "Message Templates"**, admin only; read-only list for coordinators
- Add `{ id: "message-templates", label: "Message Templates" }` to `SettingsView` tabs, as `components/views/settings/MessageTemplatesSection.tsx`.
- **Layout:** grouped by purpose. Pastoral check-in templates are grouped further by reason, with "Any reason" for the general ones. Each template shows its name, the first two lines and an active toggle.
- **Editor (modal or drawer):**
  - Fields: name, purpose, reason (only for pastoral check-in), and body.
  - **Placeholder chips** `{{firstName}}`, `{{adminName}}`, `{{churchName}}` insert at the cursor.
  - **Live preview** via `POST /message-templates/preview`, debounced at 300 ms.
  - Character count; Dove's 400 for unknown placeholders is shown inline.
- **Guidance text** at the top of the tab: _"Keep two or three versions for each purpose. Dove rotates them so messages to different people aren't identical, which helps keep the church WhatsApp number in good standing."_
- **Delete** uses `ConfirmActionModal`. Explain that a template already used in sent messages is deactivated instead of deleted.

**7.4 General Preferences (`PreferencesSection`)**
- Add **"Open WhatsApp in"**: Automatic (recommended) / WhatsApp Web / WhatsApp Business app. This is per device (section 2).

**7.5 Person edit form**
- Add a **"Don't message on WhatsApp"** toggle (`whatsappOptOut`), with the helper text "Use this if the person asks not to be contacted on WhatsApp."
- The phone field shows the normalised number Dove returns. Show Dove's 400 validation message inline.

---

## 8. Public website (`apps/web`): use "PKA"

Replace **"a.k.a."** with **"PKA"** so all member-facing apps use the same wording, e.g.
"Abiding Word Of Grace Missions (PKA Amazing Grace Bible Church)":

- `src/app/layout.tsx`: lines 25 and 31 (metadata description, Open Graph)
- `src/app/about/page.tsx`: lines 10 and 26
- `src/components/footer.tsx`: lines 133–134
- `src/components/hero.tsx`: line 18 (image alt) and line 85

---

## 9. QA checklist

- [ ] **Desktop Chrome** with WhatsApp Web logged into the church number: the message opens pre-filled with emoji and line breaks intact.
- [ ] **Android phone with both WhatsApp and WhatsApp Business:** the link opens **Business**, not personal.
- [ ] **Android without WhatsApp Business:** falls back to wa.me.
- [ ] **iPhone:** opens WhatsApp and the "check the account" callout is visible.
- [ ] Person without a phone, with an invalid phone, and opted out: each shows the right blocking state.
- [ ] Close the modal without confirming: the item appears under "Waiting for you to confirm", and confirming it there works.
- [ ] Birthday via WhatsApp after an email greeting: both badges show, and the KPIs update.
- [ ] Check-in from the queue → confirm sent → "Mark complete?" → check-in completed.
- [ ] Visitor follow-up confirm moves `followUpStatus` from Pending to In progress.
- [ ] Template editor: an unknown placeholder is rejected; the preview shows the admin's display name.
- [ ] Coordinator role: can send and view templates, cannot edit templates or church settings.
- [ ] Website shows "PKA" everywhere "a.k.a." used to be.

---

## Estimate

| Step | Scope | Estimate |
|---|---|---|
| 1 | Models, services, hooks, WhatsApp util, icon | 0.5 d |
| 2 | Compose modal, both steps | 1 d |
| 3 | Entry points (4.1–4.6) and birthday report changes | 1 d |
| 4 | Today's outreach card, person messages tab, WhatsApp log tab | 1 d |
| 5 | Settings (profile, church, templates editor, preference, opt-out) | 1 d |
| 6 | Website PKA change, real-device QA | 0.5 d |
| | **Total** | **~5 days** |
