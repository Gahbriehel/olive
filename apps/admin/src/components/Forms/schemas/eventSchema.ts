import { optionalText, requiredText, url, yup } from "@/models/validation";
import type { EventCategory, EventStatus } from "@/models/event";

const isPositiveInteger = (value: string) =>
  /^\d+$/.test(value) && Number(value) > 0;

/** Validation for EventsForm (docs/architecture.md §6.3). */
export const eventSchema = yup.object({
  title: requiredText("Event title").default(""),
  category: yup
    .string<EventCategory>()
    .required("Ministry category is required"),
  status: yup.string<EventStatus>().required("Publication status is required"),
  description: optionalText(),
  location: optionalText(),
  startDate: yup.string().required("Start date is required"),
  endDate: yup
    .string()
    .required("End date is required")
    .test("after-start", "End date must be after start date", function (value) {
      const start = this.parent.startDate as string | undefined;
      if (!start || !value) return true;
      return new Date(value) > new Date(start);
    }),
  requiresRegistration: yup.boolean().required().default(true),
  // Only meaningful (and only validated) when registration is required.
  capacity: optionalText().test(
    "positive-integer",
    "Capacity must be a whole number greater than 0",
    function (value) {
      if (!this.parent.requiresRegistration || !value) return true;
      return isPositiveInteger(value);
    },
  ),
  imageUrl: url().default(""),
  googleCalendarSync: yup.boolean().required().default(false),
  isFeatured: yup.boolean().required().default(false),
  highlights: yup.array(yup.string().defined()).required().default([]),
});

export type EventFormValues = yup.InferType<typeof eventSchema>;
