import * as yup from "yup";

export const confessionSchema = yup.object({
  title: yup
    .string()
    .trim()
    .required("Title is required")
    .max(150, "Title can be at most 150 characters"),
  slug: yup
    .string()
    .trim()
    .required("Slug is required")
    .matches(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers and single hyphens only",
    ),
  scriptureRef: yup
    .string()
    .trim()
    .max(100, "Scripture reference can be at most 100 characters")
    .default(""),
  category: yup
    .string()
    .trim()
    .max(50, "Category can be at most 50 characters")
    .default(""),
  body: yup.string().default(""),
});

export type ConfessionFormValues = yup.InferType<typeof confessionSchema>;
