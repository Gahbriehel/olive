import { yup, requiredText, url } from "@/models/validation";

const hasText = (html?: string) =>
  Boolean(
    html
      ?.replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim(),
  );

export const birthdayGreetingSchema = yup.object({
  subject: requiredText("Subject"),
  heading: requiredText("Email heading"),
  message: requiredText("Message body").test(
    "has-text",
    "Message body is required",
    hasText,
  ),
  // Accepts a site-relative path (e.g. /uploads/card.png) or an absolute URL.
  imageUrl: yup
    .string()
    .trim()
    .default("")
    .test(
      "image-url",
      "Enter a valid URL (including https://) or a path starting with /",
      (value) => !value || value.startsWith("/") || url().isValidSync(value),
    ),
  // The CTA button needs both a label and a URL, or neither.
  ctaLabel: yup
    .string()
    .trim()
    .default("")
    .test("cta-pair", "Add a label for the button URL", function (value) {
      return Boolean(value) || !this.parent.ctaUrl?.trim();
    }),
  ctaUrl: url()
    .default("")
    .test("cta-pair", "Add a URL for the button label", function (value) {
      return Boolean(value) || !this.parent.ctaLabel?.trim();
    }),
});

export type BirthdayGreetingFormValues = yup.InferType<
  typeof birthdayGreetingSchema
>;
