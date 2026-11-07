"use client";

import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { CalendarOff, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/FormElements/Input";
import { Switch } from "@/components/FormElements/Switch";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { EmptyState, ErrorState } from "@/components/ui/QueryState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";
import { useNightPrayerExceptions } from "@/hooks/useNightPrayer";
import { NightPrayerException } from "@/models/night-prayer";

/** Today's calendar date in Lagos, "YYYY-MM-DD". */
const lagosToday = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" });

const exceptionSchema = yup.object({
  date: yup
    .string()
    .required("Choose a date")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Use the format YYYY-MM-DD")
    .test(
      "not-past",
      "The date cannot be in the past",
      (v) => !v || v >= lagosToday(),
    ),
  cancelled: yup.boolean().required().default(true),
  note: yup.string().trim().max(300, "At most 300 characters").default(""),
});
type ExceptionValues = yup.InferType<typeof exceptionSchema>;

const AddExceptionModal: React.FC<{
  onClose: () => void;
  onSubmit: (v: ExceptionValues) => Promise<void>;
}> = ({ onClose, onSubmit }) => {
  const { control, handleSubmit, formState } = useForm<ExceptionValues>({
    resolver: yupResolver(exceptionSchema),
    mode: "onTouched",
    defaultValues: { date: "", cancelled: true, note: "" },
  });
  const formId = "night-prayer-exception-form";

  const submit = handleSubmit(async (v) => {
    try {
      await onSubmit(v);
      onClose();
    } catch {
      // API errors are toasted by the API client.
    }
  });

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Add date exception"
      description="Override Night Prayer for one calendar date."
      footerStart={
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      }
      footer={
        <Button type="submit" form={formId} loading={formState.isSubmitting}>
          Save exception
        </Button>
      }
    >
      <form id={formId} noValidate onSubmit={submit} className="space-y-5">
        <Controller
          name="date"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              type="date"
              min={lagosToday()}
              label="Date"
              required
              error={error?.message}
            />
          )}
        />
        <Controller
          name="cancelled"
          control={control}
          render={({ field }) => (
            <Switch
              checked={field.value}
              onChange={field.onChange}
              color="amber"
              label="Cancelled"
              description="Members see Night Prayer as cancelled and no pushes are sent for this date."
            />
          )}
        />
        <Controller
          name="note"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              value={field.value ?? ""}
              label="Note"
              placeholder="Back tomorrow, God bless you"
              error={error?.message}
              hint="Optional. Shown to members."
            />
          )}
        />
      </form>
    </Modal>
  );
};

export const ExceptionsSection: React.FC = () => {
  const {
    exceptions,
    isLoading,
    isError,
    refetch,
    createException,
    deleteException,
    isDeleting,
  } = useNightPrayerExceptions();
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<NightPrayerException | null>(null);

  return (
    <Card>
      <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Upcoming exceptions</CardTitle>
          <CardDescription>
            Dates when Night Prayer is cancelled or changed.
          </CardDescription>
        </div>
        <Button
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setAdding(true)}
        >
          Add date exception
        </Button>
      </CardHeader>

      <div className="p-5 pt-2">
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : isError ? (
          <ErrorState resource="exceptions" onRetry={() => refetch()} />
        ) : exceptions.length === 0 ? (
          <EmptyState
            icon={CalendarOff}
            title="No upcoming exceptions"
            description="Night Prayer follows the normal schedule."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-fg-muted">
                <tr>
                  <th className="py-2 pr-4 font-semibold">Date</th>
                  <th className="py-2 pr-4 font-semibold">Status</th>
                  <th className="py-2 pr-4 font-semibold">Note</th>
                  <th className="py-2 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {exceptions.map((e) => (
                  <tr key={e.id}>
                    <td className="py-2.5 pr-4 font-mono text-xs">{e.date}</td>
                    <td className="py-2.5 pr-4">
                      <Badge
                        size="sm"
                        variant={e.cancelled ? "amber" : "slate"}
                      >
                        {e.cancelled ? "Cancelled" : "Changed"}
                      </Badge>
                    </td>
                    <td className="py-2.5 pr-4 text-fg-muted">
                      {e.note || "—"}
                    </td>
                    <td className="py-2.5 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete exception for ${e.date}`}
                        onClick={() => setDeleting(e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {adding && (
        <AddExceptionModal
          onClose={() => setAdding(false)}
          onSubmit={async (v) => {
            await createException({
              date: v.date,
              cancelled: v.cancelled,
              note: v.note?.trim() || undefined,
            });
          }}
        />
      )}

      <ConfirmActionModal
        display={Boolean(deleting)}
        close={() => setDeleting(null)}
        title={`Delete the exception for ${deleting?.date ?? ""}?`}
        description="Night Prayer will follow the normal schedule on that date."
        confirmLabel="Delete exception"
        loading={isDeleting}
        fn={async () => {
          if (deleting) await deleteException(deleting.id);
        }}
      />
    </Card>
  );
};
