import { yup, requiredText, optionalText } from "@/models/validation";

export const departmentSchema = yup.object({
  name: requiredText("Department name").max(100, "Max 100 characters"),
  description: optionalText().max(500, "Max 500 characters"),
});

export type DepartmentFormValues = yup.InferType<typeof departmentSchema>;
