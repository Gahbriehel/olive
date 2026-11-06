import { requiredText, yup } from "@/models/validation";
import { GIVING_CURRENCIES, GIVING_PURPOSES } from "@/models/giving-account";

/** Account numbers are stored as digits only; spaces and hyphens are stripped. */
export const normalizeAccountNumber = (value: string) =>
  value.replace(/[\s-]/g, "");

export const givingAccountSchema = yup.object({
  label: requiredText("Label").max(100, "Label can be at most 100 characters"),
  bankName: requiredText("Bank name").max(
    100,
    "Bank name can be at most 100 characters",
  ),
  accountName: requiredText("Account name").max(
    255,
    "Account name can be at most 255 characters",
  ),
  currency: yup
    .string()
    .oneOf([...GIVING_CURRENCIES])
    .required("Currency is required"),
  accountNumber: yup
    .string()
    .trim()
    .required("Account number is required")
    .test("digits", "Account number must contain digits only", (v) =>
      /^\d*$/.test(normalizeAccountNumber(v ?? "")),
    )
    .test("length", function (v) {
      const digits = normalizeAccountNumber(v ?? "");
      if (!/^\d+$/.test(digits)) return true; // reported by the digits test
      if (this.parent.currency === "NGN") {
        return (
          digits.length === 10 ||
          this.createError({
            message: "NGN account numbers must be exactly 10 digits",
          })
        );
      }
      return (
        (digits.length >= 6 && digits.length <= 34) ||
        this.createError({
          message: "Account number must be 6–34 digits",
        })
      );
    }),
  note: yup
    .string()
    .trim()
    .max(500, "Note can be at most 500 characters")
    .default(""),
  purposes: yup
    .array()
    .of(
      yup
        .string()
        .oneOf(GIVING_PURPOSES.map((p) => p.id))
        .required(),
    )
    .min(1, "Select at least one purpose")
    .max(6)
    .required("Select at least one purpose"),
  isActive: yup.boolean().required(),
});

export type GivingAccountFormValues = yup.InferType<typeof givingAccountSchema>;
