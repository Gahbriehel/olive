# Confessions: Admin Implementation Guide (Olive)

This guide covers the implementation of the **Confessions Library** management screens in Olive (`apps/admin`), backed by Dove's `/api/v1/confessions` API.

**Access Level:** `ADMIN` and `SUPER_ADMIN` only (`COORDINATOR` and members cannot access or modify confessions).

---

## 1. Overview

Confessions are short, faith-building texts read or listened to by members in the PWA (`abwog-lifestyle`). Each confession has:
- A staff-curated display order (`sortOrder`).
- Optional recorded audio (one **female** and one **male** MP3) generated off-server with Kokoro and uploaded by staff.
- An automatic out-of-date detection (`audioStale`) that flags when a confession's text has been modified after audio was uploaded.
- Public listen counts tracked by Dove.

### What Staff Can Do in Olive
1. **List & Order:** View all confessions (draft and live) in exact display order; drag and drop rows to reorder them in one operation.
2. **Author & Edit:** Create and update confessions with real-time word counting, slug management, category assignment, and scripture references.
3. **Audio Management:** Upload, preview, replace, and delete female and male MP3 files per confession, with prominent "Audio out of date" warnings.
4. **Phone Preview:** Inspect a responsive, phone-width preview of how the confession appears in the member PWA.

---

## 2. API Endpoints Reference

Base URL: `/api/v1/confessions`  
Header: `Authorization: Bearer <staff_jwt>`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/confessions?page=1&limit=200` | Fetch all confessions for church (includes drafts & `audioStale`) |
| `GET` | `/confessions/categories` | Distinct categories of published confessions |
| `GET` | `/confessions/:idOrSlug` | Full confession details (with body, neighbours, and `audioStale`) |
| `POST` | `/confessions` | Create new confession (defaults to `DRAFT`) |
| `PATCH` | `/confessions/reorder` | Save full reordered ID list `{ ids: string[] }` |
| `PATCH` | `/confessions/:id` | Update confession text, slug, category, scripture, or status |
| `DELETE` | `/confessions/:id` | Hard delete confession and its audio files |
| `PUT` | `/confessions/:id/audio/:voice` | Upload or replace audio (`voice` is `female` or `male`, `multipart/form-data`) |
| `DELETE` | `/confessions/:id/audio/:voice` | Delete audio file for a specific voice |

---

## 3. Data Model & Types

### `src/models/confession.ts`

```typescript
export type ConfessionStatus = 'DRAFT' | 'PUBLISHED';
export type ConfessionVoice = 'female' | 'male';

export interface ConfessionAudioFile {
  url: string;         // e.g. /public/confession-audio/<id>/female-a1b2c3d4.mp3
  durationSec: number; // e.g. 52
}

export interface ConfessionAudioMap {
  female?: ConfessionAudioFile;
  male?: ConfessionAudioFile;
}

export interface ConfessionAudioStaleMap {
  female?: boolean;
  male?: boolean;
}

export interface ConfessionNeighbour {
  slug: string;
  title: string;
}

export interface ConfessionListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  scriptureRef: string | null;
  category: string | null;
  status: ConfessionStatus;
  position: number | null; // 1-based rank among published, null for drafts
  wordCount: number;
  listenCount: number;
  audio: ConfessionAudioMap;
  audioStale?: ConfessionAudioStaleMap;
}

export interface ConfessionDetail extends ConfessionListItem {
  body: string;
  previous: ConfessionNeighbour | null;
  next: ConfessionNeighbour | null;
}

export interface ConfessionListResponse {
  items: ConfessionListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateConfessionPayload {
  title: string;
  slug?: string;
  body: string;
  scriptureRef?: string | null;
  category?: string | null;
  status?: ConfessionStatus;
}

export interface UpdateConfessionPayload {
  title?: string;
  slug?: string;
  body?: string;
  scriptureRef?: string | null;
  category?: string | null;
  status?: ConfessionStatus;
}

export interface ReorderConfessionsPayload {
  ids: string[];
}
```

---

## 4. API Service

### `src/services/confessions.service.ts`

```typescript
import apiClient from './apiClient';
import { extractData } from '@/utils/api';
import {
  ConfessionDetail,
  ConfessionListItem,
  ConfessionListResponse,
  CreateConfessionPayload,
  ReorderConfessionsPayload,
  UpdateConfessionPayload,
} from '@/models/confession';

export const confessionsService = {
  /**
   * Fetch all confessions for the admin dashboard.
   * Default limit 200 loads the full library for drag-and-drop reordering.
   */
  async getAll(params?: {
    search?: string;
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ConfessionListResponse> {
    const response = await apiClient.get('/confessions', {
      params: {
        limit: 200,
        ...params,
      },
    });
    return extractData<ConfessionListResponse>(response);
  },

  /**
   * Fetch distinct published categories.
   */
  async getCategories(): Promise<string[]> {
    const response = await apiClient.get('/confessions/categories');
    return extractData<string[]>(response);
  },

  /**
   * Fetch single confession with full body and audio info.
   */
  async getById(idOrSlug: string): Promise<ConfessionDetail> {
    const response = await apiClient.get(`/confessions/${idOrSlug}`);
    return extractData<ConfessionDetail>(response);
  },

  /**
   * Create a new confession.
   */
  async create(payload: CreateConfessionPayload): Promise<ConfessionDetail> {
    const response = await apiClient.post('/confessions', payload);
    return extractData<ConfessionDetail>(response);
  },

  /**
   * Update confession details or status.
   */
  async update(id: string, payload: UpdateConfessionPayload): Promise<ConfessionDetail> {
    const response = await apiClient.patch(`/confessions/${id}`, payload);
    return extractData<ConfessionDetail>(response);
  },

  /**
   * Save the full ordered list of IDs.
   */
  async reorder(payload: ReorderConfessionsPayload): Promise<{ reordered: number }> {
    const response = await apiClient.patch('/confessions/reorder', payload);
    return extractData<{ reordered: number }>(response);
  },

  /**
   * Delete a confession and its on-disk audio.
   */
  async delete(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/confessions/${id}`);
    return extractData<{ message: string }>(response);
  },

  /**
   * Upload or replace an audio MP3 for a voice (female or male).
   */
  async uploadAudio(
    id: string,
    voice: 'female' | 'male',
    file: File,
  ): Promise<ConfessionDetail> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.put(`/confessions/${id}/audio/${voice}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return extractData<ConfessionDetail>(response);
  },

  /**
   * Delete audio file for a voice slot.
   */
  async deleteAudio(id: string, voice: 'female' | 'male'): Promise<{ message: string }> {
    const response = await apiClient.delete(`/confessions/${id}/audio/${voice}`);
    return extractData<{ message: string }>(response);
  },
};
```

---

## 5. React Query Hooks

### `src/hooks/useConfessions.ts`

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { confessionsService } from '@/services/confessions.service';
import {
  CreateConfessionPayload,
  ReorderConfessionsPayload,
  UpdateConfessionPayload,
} from '@/models/confession';

export const CONFESSIONS_QUERY_KEY = ['confessions'];
export const CONFESSION_DETAIL_KEY = (id: string) => ['confessions', id];
export const CONFESSION_CATEGORIES_KEY = ['confessions', 'categories'];

export function useConfessions(params?: {
  search?: string;
  category?: string;
  status?: string;
}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...CONFESSIONS_QUERY_KEY, params],
    queryFn: () => confessionsService.getAll(params),
  });

  const categoriesQuery = useQuery({
    queryKey: CONFESSION_CATEGORIES_KEY,
    queryFn: () => confessionsService.getCategories(),
  });

  const reorderMutation = useMutation({
    mutationFn: (payload: ReorderConfessionsPayload) =>
      confessionsService.reorder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONFESSIONS_QUERY_KEY });
      toast.success('Display order saved');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save reorder');
      queryClient.invalidateQueries({ queryKey: CONFESSIONS_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => confessionsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONFESSIONS_QUERY_KEY });
      toast.success('Confession deleted');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete confession');
    },
  });

  return {
    ...query,
    categories: categoriesQuery.data ?? [],
    reorder: reorderMutation.mutateAsync,
    isReordering: reorderMutation.isPending,
    deleteConfession: deleteMutation.mutateAsync,
  };
}

export function useConfessionDetail(id: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: CONFESSION_DETAIL_KEY(id),
    queryFn: () => confessionsService.getById(id),
    enabled: Boolean(id) && id !== 'new',
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateConfessionPayload) =>
      confessionsService.update(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(CONFESSION_DETAIL_KEY(id), updated);
      queryClient.invalidateQueries({ queryKey: CONFESSIONS_QUERY_KEY });
      toast.success('Confession saved');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update confession');
    },
  });

  const uploadAudioMutation = useMutation({
    mutationFn: ({ voice, file }: { voice: 'female' | 'male'; file: File }) =>
      confessionsService.uploadAudio(id, voice, file),
    onSuccess: (updated) => {
      queryClient.setQueryData(CONFESSION_DETAIL_KEY(id), updated);
      queryClient.invalidateQueries({ queryKey: CONFESSIONS_QUERY_KEY });
      toast.success('Audio uploaded successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to upload audio');
    },
  });

  const deleteAudioMutation = useMutation({
    mutationFn: (voice: 'female' | 'male') =>
      confessionsService.deleteAudio(id, voice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONFESSION_DETAIL_KEY(id) });
      queryClient.invalidateQueries({ queryKey: CONFESSIONS_QUERY_KEY });
      toast.success('Audio file removed');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete audio');
    },
  });

  return {
    ...query,
    updateConfession: updateMutation.mutateAsync,
    isSaving: updateMutation.isPending,
    uploadAudio: uploadAudioMutation.mutateAsync,
    isUploadingAudio: uploadAudioMutation.isPending,
    deleteAudio: deleteAudioMutation.mutateAsync,
  };
}
```

---

## 6. UI Screen Specifications

### 6.1 Confessions List Screen (`/confessions`)

```
+-----------------------------------------------------------------------------------------+
| Confessions Library                                     [+ Add Confession]              |
| Curate and order confessions for the member PWA.                                        |
+-----------------------------------------------------------------------------------------+
| [ Search confessions... ]   [ Category: All v ]   [ Status: All v ]                     |
+-----------------------------------------------------------------------------------------+
| ::   #  Title                    Category   Status     Audio (F / M)    Listens Actions |
| --------------------------------------------------------------------------------------- |
| [=]  1  Confession to Start Day  Daily      [Live]     [OK]   [Stale]     143   [Edit]  |
| [=]  -  Healing Over My Family   Healing    [Draft]    [None] [None]        0   [Edit]  |
| [=]  2  Walking in Divine Favor  Favor      [Live]     [OK]   [OK]        420   [Edit]  |
+-----------------------------------------------------------------------------------------+
```

#### Key Functional Behaviors
1. **Initial Load:** Fetch using `limit=200` so staff can manage the full church library.
2. **Order & Reorder:**
   - Display items sorted by their existing order.
   - Published confessions display their computed 1-based `position` badge (e.g. `1`, `2`). Drafts display a `-` badge.
   - Use drag-and-drop (e.g. `@dnd-kit/core` or HTML5 drag) with a handle `[=]`.
   - On drop, optimistically update UI list state, then send `PATCH /confessions/reorder` with `{ ids: currentList.map(c => c.id) }`.
   - If reordering fails, roll back UI state and show error toast.
3. **Status Badges:**
   - `PUBLISHED`: Green badge `Live`
   - `DRAFT`: Gray badge `Draft`
4. **Audio Badges:**
   - Render two badges per row for Female (`F`) and Male (`M`):
     - **Green (`OK`)**: Audio exists and `audioStale[voice]` is false.
     - **Amber / Red (`Out of Date`)**: Audio exists but `audioStale[voice]` is true.
     - **Gray (`None`)**: No audio uploaded for this slot.
5. **Listen Count:** Display formatted number (e.g., `1,240`).

---

### 6.2 Confession Editor Screen (`/confessions/[id]`)

A split-view layout: Left 60% contains the form editor; Right 40% contains the phone preview and audio panel.

```
+-----------------------------------------------------------------------------------------+
| [<- Back to Confessions]         Confession Editor             [Delete] [Save] [Publish]|
+-----------------------------------------------------------------------------------------+
| Title: [ Confession to Start my Day                                                   ] |
| Slug:  [ confession-to-start-my-day                ] (i) Warn if changed after creation |
|                                                                                         |
| Scripture Ref: [ Psalm 118:24          ]   Category: [ Daily                        v ] |
|                                                                                         |
| Plain-Text Body:                                           [ 281 words | 1,420 chars ]  |
| +-------------------------------------------------------------------------------------+ |
| | I declare that this is the best day of my life yet.                                 | |
| |                                                                                     | |
| | As soon as my feet hit the floor and I take my first steps...                       | |
| +-------------------------------------------------------------------------------------+ |
| (i) Blank lines separate paragraphs. Symbols/markdown will be read literally by TTS.   |
|                                                                                         |
| Audio Recordings (Kokoro)                                                               |
| +-------------------------------------------------------------------------------------+ |
| | FEMALE VOICE                                                                        | |
| | [ Play > ] [ 0:52 ] [ /public/.../female-a1b2c3d4.mp3 ]                             | |
| | [Upload / Replace MP3]   [Remove]                                                   | |
| +-------------------------------------------------------------------------------------+ |
| | MALE VOICE                                             [! Audio Out of Date]        | |
| | [ Play > ] [ 0:57 ] [ /public/.../male-e5f6a7b8.mp3 ]                               | |
| | [Upload / Replace MP3]   [Remove]                                                   | |
| +-------------------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------------------+
```

#### Form Fields & Validation
- **Title (`title`)**: Text input, required, 1–150 chars.
- **Slug (`slug`)**:
  - Auto-generated on create from the title (lowercase letters, numbers, and hyphens).
  - Can be manually edited.
  - When editing an existing confession, show warning modal/callout: *"Changing the slug will break existing bookmarks and shared links in the member PWA."*
- **Scripture Ref (`scriptureRef`)**: Optional text, max 100 chars (e.g. `Psalm 118:24` or `Romans 8:28-30`).
- **Category (`category`)**:
  - Autocomplete / Combobox displaying existing published categories (`useConfessions().categories`), allowing custom entry (max 50 chars).
- **Body (`body`)**:
  - Multi-line textarea (plain text only; no WYSIWYG or rich-text editor).
  - Normalizes line endings automatically.
  - Shows real-time word counter (`body.trim().split(/\s+/).length`) and character counter.
- **Publish / Unpublish Action:**
  - Changing status to `PUBLISHED` validates that `title` and `body` are non-empty.
  - Disabled or shows error tooltip if body is empty.

---

### 6.3 Audio Management Panel

Each confession has two distinct audio slots: **Female** and **Male**.

#### Voice Slot States
1. **Empty State:**
   - Shows empty audio icon.
   - Text: *"No audio uploaded yet. Phone PWA will use built-in browser speech synthesis."*
   - Button: `Upload MP3` (opens file selector with `accept="audio/mp3,audio/mpeg"`).
2. **Uploaded & Active State:**
   - HTML5 `<audio>` player element pointing to Dove host URL (e.g., `${API_ORIGIN}${audio.female.url}`).
   - Displays duration in `mm:ss` format.
   - Buttons: `Replace MP3` and `Delete Audio`.
3. **Out-of-Date State (`audioStale === true`):**
   - Renders alert badge: `⚠️ Audio Out of Date`.
   - Helper text: *"The confession text was edited after this audio was uploaded. Please generate a new recording with Kokoro and upload to replace."*

#### Upload Requirements
- File size check: Reject files `> 25 MB` in the frontend before sending.
- File type check: Must be `.mp3`.
- Send via `PUT /confessions/:id/audio/:voice` using `multipart/form-data`.
- Loading spinner on the specific slot during upload.

---

### 6.4 Phone-width Reader Preview

To ensure pastoral staff write text that reads comfortably on mobile screens, provide a live phone simulator pane (width ~375px):
- Shows selected category pill at top.
- Confession title in clean typography.
- Scripture reference badge.
- Audio player mock matching PWA design (Female/Male voice pill toggle, play button).
- Formatted paragraphs split cleanly on blank lines.

---

## 7. Staff Guide: Preparing Kokoro Audio Files

Include a link/modal in the audio panel with instructions for church media staff:

1. **Kokoro TTS Setup:** Generate voice MP3s on staff computer (Kokoro is run locally to prevent server RAM exhaustion).
2. **Recommended Voices:**
   - **Female:** `af_heart`
   - **Male:** `am_michael`
3. **Pace:** Speed setting **`0.9`** (slightly slower than Kokoro default for clear devotional listening).
4. **Format:** Mono MP3 at 64 kbps or 128 kbps.
5. **Silence Between Paragraphs:** Add ~0.7 seconds of silence between paragraphs.
6. **Upload:** Go to the confession in Olive, click **Upload MP3** for Female and Male slots respectively.

---

## 8. Error Handling & Edge Cases

| Scenario | HTTP Status | Olive Frontend Handling |
|---|---|---|
| Taken slug | `409 Conflict` | Highlight slug field: *"This slug is already used by another confession. Choose a different one."* |
| Non-MP3 uploaded | `400 Bad Request` | Display alert: *"Invalid file. Only genuine MP3 audio files are supported."* |
| File > 25 MB | `400 Bad Request` | Block in UI: *"Audio file cannot exceed 25 MB."* |
| Reorder collision | `400 Bad Request` | Refresh confessions list via React Query and alert staff to retry. |
| Empty publish attempt | `400 Bad Request` | Form prevents submission; highlights empty Title or Body field. |
