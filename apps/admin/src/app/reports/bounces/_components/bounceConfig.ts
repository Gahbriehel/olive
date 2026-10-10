import { EmailBounceTabFilter } from "@/models/emailBounce";
import { type IQueryParams } from "@/models/base";
import { type FilterField } from "@/models/filters";

export const bounceFilterFields: FilterField[] = [
  {
    type: "select",
    key: "emailType",
    label: "Email Type",
    allLabel: "All Email Types",
    options: [
      {
        label: "Registration Confirmation",
        value: "REGISTRATION_CONFIRMATION",
      },
      { label: "Custom Broadcast", value: "CUSTOM_BROADCAST" },
      { label: "Admin Welcome", value: "ADMIN_WELCOME" },
    ],
  },
  {
    type: "select",
    key: "recipientType",
    label: "Recipient Type",
    allLabel: "All Recipients",
    options: [
      { label: "Person (Member/Visitor)", value: "PERSON" },
      { label: "User (Admin/Staff)", value: "USER" },
    ],
  },
];

export const tabQueryParams: Record<EmailBounceTabFilter, IQueryParams> = {
  [EmailBounceTabFilter.ALL]: {},
  [EmailBounceTabFilter.UNRESOLVED]: { isResolved: false },
  [EmailBounceTabFilter.RESOLVED]: { isResolved: true },
  [EmailBounceTabFilter.HARD_BOUNCE]: { bounceType: "Hard" },
  [EmailBounceTabFilter.SOFT_BOUNCE]: { bounceType: "Soft" },
};

export const BOUNCE_EXPORT_ENDPOINT = "/email-bounces/export";

export const bounceExportFilename = () =>
  `email-bounces-${new Date().toISOString().slice(0, 10)}.csv`;
