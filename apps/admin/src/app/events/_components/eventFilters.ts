import { type FilterField } from "@/models/filters";

// Rendered inline in the toolbar rather than in the filters panel.
export const eventSelectFields = [
  {
    type: "select",
    key: "status",
    label: "Status",
    allLabel: "All Statuses",
    options: [
      { label: "Published", value: "PUBLISHED" },
      { label: "Draft", value: "DRAFT" },
      { label: "Completed", value: "COMPLETED" },
      { label: "Cancelled", value: "CANCELLED" },
    ],
  },
  {
    type: "select",
    key: "category",
    label: "Category",
    allLabel: "All Categories",
    options: [
      "GENERAL",
      "CONFERENCE",
      "VIGIL",
      "COMMUNION",
      "REVIVAL",
      "WORSHIP",
      "OUTREACH",
    ].map((c) => ({ label: c, value: c })),
  },
  {
    type: "boolean",
    key: "requiresRegistration",
    label: "Admission Type",
    allLabel: "All Admission Types",
    trueLabel: "Registration Required",
    falseLabel: "Open Admission",
  },
] satisfies FilterField[];

export const eventFilterFields: FilterField[] = [
  ...eventSelectFields,
  {
    type: "boolean",
    key: "isFeatured",
    label: "Featured",
    trueLabel: "Featured On Website",
    falseLabel: "Standard",
  },
];

export const EVENT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
