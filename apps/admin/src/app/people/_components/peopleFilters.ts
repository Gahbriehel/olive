import { type FilterField } from "@/models/filters";

export const peopleFilterFields: FilterField[] = [
  {
    type: "select",
    key: "membershipStatus",
    label: "Membership Status",
    allLabel: "All Statuses",
    options: [
      { label: "Visitor", value: "VISITOR" },
      { label: "Member", value: "MEMBER" },
      { label: "Worker", value: "WORKER" },
      { label: "Leader", value: "LEADER" },
      { label: "Pastor", value: "PASTOR" },
    ],
  },
  {
    type: "select",
    key: "followUpStatus",
    label: "Follow-up Status",
    allLabel: "All Follow-up Statuses",
    options: [
      { label: "Pending", value: "PENDING" },
      { label: "In Progress", value: "IN_PROGRESS" },
      { label: "Converted", value: "CONVERTED" },
      { label: "Inactive", value: "INACTIVE" },
    ],
  },
  {
    type: "select",
    key: "gender",
    label: "Gender",
    allLabel: "All Genders",
    options: [
      { label: "Male", value: "MALE" },
      { label: "Female", value: "FEMALE" },
      { label: "Other", value: "OTHER" },
    ],
  },
];
