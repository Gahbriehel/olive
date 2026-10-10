import { type FilterField } from "@/models/filters";

export const peopleFilterFields: FilterField[] = [
  {
    type: "select",
    key: "membershipStatus",
    label: "Membership Status",
    allLabel: "All Statuses",
    options: [
      { label: "Member", value: "Member" },
      { label: "Worker", value: "Worker" },
      { label: "Leader", value: "Leader" },
      { label: "Visitor", value: "Visitor" },
    ],
  },
  {
    type: "select",
    key: "gender",
    label: "Gender",
    allLabel: "All Genders",
    options: [
      { label: "Male", value: "Male" },
      { label: "Female", value: "Female" },
    ],
  },
];
