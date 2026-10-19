import { yup, requiredText, optionalText } from "@/models/validation";

export const departmentMemberSchema = yup.object({
  personId: requiredText("Member"),
  role: optionalText().default("Member"),
});

export type DepartmentMemberFormValues = yup.InferType<
  typeof departmentMemberSchema
>;
