import { yup, requiredText, email, phone } from "@/models/validation";
import { GENDERS, pastDate } from "./personSchema";
import type { ApiGender } from "@/models/person";

export const registerPersonSchema = yup.object({
  eventId: yup.string().required("Select an event"),
  firstName: requiredText("First name"),
  lastName: requiredText("Last name"),
  // Optional on IRegistrationPayload; validated when filled in.
  email: email().default(""),
  phone: phone().default(""),
  gender: yup.mixed<ApiGender>().oneOf(GENDERS, "Select a gender").optional(),
  dateOfBirth: pastDate(),
});

export type RegisterPersonFormValues = yup.InferType<
  typeof registerPersonSchema
>;
