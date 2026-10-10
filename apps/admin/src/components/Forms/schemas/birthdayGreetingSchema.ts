import { yup } from "@/models/validation";
import {
  emailContentFields,
  emailImageField,
} from "@/components/email/emailFields";

export const birthdayGreetingSchema = yup.object({
  ...emailContentFields(),
  ...emailImageField({ allowRelativePath: true }),
});

export type BirthdayGreetingFormValues = yup.InferType<
  typeof birthdayGreetingSchema
>;
