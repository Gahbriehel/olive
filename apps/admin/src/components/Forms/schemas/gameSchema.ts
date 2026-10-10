import { optionalText, requiredText, yup } from "@/models/validation";

export const gameSchema = yup.object({
  name: requiredText("Game name"),
  description: optionalText(),
  maxScore: yup
    .number()
    // The number input reports "" when cleared; treat that as missing.
    .transform((value, original) =>
      original === "" || original === null ? undefined : value,
    )
    .typeError("Max score must be a number")
    .required("Max score is required")
    .integer("Max score must be a whole number")
    .positive("Max score must be greater than 0"),
});

export type GameSchemaValues = yup.InferType<typeof gameSchema>;
