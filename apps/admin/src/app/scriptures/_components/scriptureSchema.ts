import * as yup from "yup";

export const scriptureSchema = yup.object({
  text: yup
    .string()
    .required("Scripture text is required")
    .test("not-blank", "Scripture text is required", (v) => !!v?.trim())
    .max(1500, "Text can be at most 1500 characters"),
  reference: yup
    .string()
    .trim()
    .required("Reference is required")
    .max(100, "Reference can be at most 100 characters"),
  translation: yup
    .string()
    .trim()
    .max(20, "Translation can be at most 20 characters")
    .default(""),
  givenBy: yup
    .string()
    .trim()
    .max(100, "Given by can be at most 100 characters")
    .default(""),
  startsOn: yup
    .string()
    .required("Choose a start date")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Use the format YYYY-MM-DD"),
  published: yup.boolean().required().default(false),
});

export type ScriptureFormValues = yup.InferType<typeof scriptureSchema>;
