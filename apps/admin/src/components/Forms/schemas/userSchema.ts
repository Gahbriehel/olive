import { phone, requiredEmail, requiredText, yup } from "@/models/validation";

export const userSchema = yup.object({
  firstName: requiredText("First name"),
  lastName: requiredText("Last name"),
  email: requiredEmail(),
  phone: phone(),
  role: yup.string().required("Role assignment is required"),
  status: yup.mixed<"Active" | "Inactive">().oneOf(["Active", "Inactive"]),
  // Optional in both modes; when filled in it must be long enough.
  password: yup
    .string()
    .test(
      "password-length",
      "Password must be at least 6 characters",
      (value) => !value || value.length >= 6,
    ),
});

export type UserSchemaValues = yup.InferType<typeof userSchema>;
