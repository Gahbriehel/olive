import { optionalText, requiredText, url, yup } from "@/models/validation";

/*
 * Shared validation for the email content fields rendered by EmailComposer.
 * Each composer's schema spreads these (plus its own recipient fields), so the
 * common fields validate the same way everywhere.
 */

/** True when rich-text HTML has visible text (an empty editor yields "<p><br></p>"). */
const hasText = (html?: string) =>
  Boolean(
    html
      ?.replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim(),
  );

const subject = () => requiredText("Subject");

const requiredHeading = () => requiredText("Email heading");

const message = () =>
  requiredText("Message body").test(
    "has-text",
    "Message body is required",
    hasText,
  );

/**
 * Absolute URL; with `allowRelativePath`, also a site-relative path
 * (e.g. /uploads/card.png). Only enable that where the API accepts paths.
 */
const imageUrl = (allowRelativePath: boolean) =>
  allowRelativePath
    ? yup
        .string()
        .trim()
        .default("")
        .test(
          "image-url",
          "Enter a valid URL (including https://) or a path starting with /",
          (value) =>
            !value || value.startsWith("/") || url().isValidSync(value),
        )
    : url().default("");

/** The CTA button needs both a label and a URL, or neither. */
const ctaLabel = () =>
  yup
    .string()
    .trim()
    .default("")
    .test("cta-pair", "Add a label for the button URL", function (value) {
      return Boolean(value) || !this.parent.ctaUrl?.trim();
    });

const ctaUrl = () =>
  url()
    .default("")
    .test("cta-pair", "Add a URL for the button label", function (value) {
      return Boolean(value) || !this.parent.ctaLabel?.trim();
    });

/** Subject, required heading, message body and the CTA pair. */
export const emailContentFields = () => ({
  subject: subject(),
  heading: requiredHeading(),
  message: message(),
  ctaLabel: ctaLabel(),
  ctaUrl: ctaUrl(),
});

/** Same as emailContentFields, with an optional heading. */
export const emailContentFieldsOptionalHeading = () => ({
  ...emailContentFields(),
  heading: optionalText(),
});

/** Optional image / flyer URL field. */
export const emailImageField = ({
  allowRelativePath = false,
}: { allowRelativePath?: boolean } = {}) => ({
  imageUrl: imageUrl(allowRelativePath),
});

/** Optional "include QR check-in pass" toggle. */
export const emailQrPassField = () => ({
  includeQrPass: yup.boolean().required(),
});

/** Trimmed value, or undefined when empty (optional payload fields). */
export const trimOrUndefined = (value?: string) => value?.trim() || undefined;
