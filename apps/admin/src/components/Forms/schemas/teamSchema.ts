import { requiredText, yup } from "@/models/validation";

export const HEX_COLOR_PATTERN = /^#[0-9A-F]{6}$/i;

export const teamSchema = yup.object({
  name: requiredText("Team name"),
  color: yup
    .string()
    .trim()
    .required("Team colour is required")
    .matches(HEX_COLOR_PATTERN, "Enter a hex colour like #6366F1"),
});

export type TeamSchemaValues = yup.InferType<typeof teamSchema>;
