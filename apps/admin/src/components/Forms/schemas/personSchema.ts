import {
  yup,
  requiredText,
  optionalText,
  email,
  phone,
} from "@/models/validation";
import type { ApiGender, ApiMembershipStatus } from "@/models/person";

export const GENDERS: ApiGender[] = ["MALE", "FEMALE", "OTHER"];
export const MEMBERSHIP_STATUSES: ApiMembershipStatus[] = [
  "VISITOR",
  "MEMBER",
  "WORKER",
  "LEADER",
];

/** Optional yyyy-mm-dd date that can't be in the future. */
export const pastDate = () =>
  optionalText().test(
    "not-future",
    "Date of birth can't be in the future",
    (value) => !value || value <= new Date().toISOString().slice(0, 10),
  );

export const personSchema = yup.object({
  firstName: requiredText("First name").max(100, "Max 100 characters"),
  lastName: requiredText("Last name").max(100, "Max 100 characters"),
  email: email().default(""),
  phone: phone().default(""),
  gender: yup
    .mixed<ApiGender>()
    .oneOf(GENDERS, "Select a gender")
    .required("Gender is required"),
  membershipStatus: yup
    .mixed<ApiMembershipStatus>()
    .oneOf(MEMBERSHIP_STATUSES, "Select a membership category")
    .required("Membership category is required"),
  dateOfBirth: pastDate(),
  address: optionalText(),
});

export type PersonFormValues = yup.InferType<typeof personSchema>;
