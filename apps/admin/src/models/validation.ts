import * as yup from "yup";

/*
 * Shared validation rules (docs/architecture.md §6.3). Each form defines a
 * yup schema built from these and wires it with
 * `useForm({ resolver: yupResolver(schema), mode: "onTouched" })`.
 */

export const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

/** Digits with optional +, spaces, dashes, dots and brackets; 7–15 digits. */
export const PHONE_PATTERN = /^\+?[\d\s().-]{7,20}$/;

/** Required, trimmed text. */
export const requiredText = (label: string) =>
  yup.string().trim().required(`${label} is required`);

/** Optional text: empty input becomes "" rather than failing. */
export const optionalText = () => yup.string().trim().default("");

export const email = () =>
  yup.string().trim().matches(EMAIL_PATTERN, {
    message: "Enter a valid email address",
    excludeEmptyString: true,
  });

export const requiredEmail = () => email().required("Email is required");

/** Optional phone number; validated only when filled in. */
export const phone = () =>
  yup
    .string()
    .trim()
    .test(
      "phone",
      "Enter a valid phone number",
      (value) =>
        !value ||
        (PHONE_PATTERN.test(value) &&
          value.replace(/\D/g, "").length >= 7 &&
          value.replace(/\D/g, "").length <= 15),
    );

/** Optional URL; validated only when filled in. */
export const url = () =>
  yup.string().trim().url("Enter a valid URL (including https://)");

export { yup };
