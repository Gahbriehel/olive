"use client";

import React, { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Search } from "lucide-react";
import { Input } from "@/components/FormElements/Input";
import { Button } from "@/components/ui/Button";
import { FormFooter } from "@/components/ui/FormFooter";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FormField } from "@/components/ui/FormField";
import { useUnsavedChangesGuard } from "@/components/ui/UnsavedChanges";
import { usePeople } from "@/hooks/usePeople";
import { adaptApiPersonToPerson, IPerson } from "@/models/person";
import { IDepartment } from "@/models/department";
import { getInitials } from "@/utils/formatters";
import {
  departmentMemberSchema,
  type DepartmentMemberFormValues,
} from "./schemas/departmentMemberSchema";

export type { DepartmentMemberFormValues };

interface DepartmentMemberFormProps {
  department: IDepartment;
  onSubmit: (data: DepartmentMemberFormValues) => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const COMMON_ROLES = [
  "Member",
  "Lead",
  "Assistant Lead",
  "Secretary",
  "Coordinator",
  "Volunteer",
];

export const DepartmentMemberForm: React.FC<DepartmentMemberFormProps> = ({
  department,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<IPerson | null>(null);

  const { control, handleSubmit, formState, setValue } =
    useForm<DepartmentMemberFormValues>({
      resolver: yupResolver(departmentMemberSchema),
      mode: "onTouched",
      defaultValues: {
        personId: "",
        role: "Member",
      },
    });

  const { guard } = useUnsavedChangesGuard(
    formState.isDirty && !formState.isSubmitSuccessful,
  );

  const { people: rawPeople, isLoading: isSearching } = usePeople({
    search: searchTerm,
    limit: 10,
  });

  const people = useMemo(
    () =>
      Array.isArray(rawPeople) ? rawPeople.map(adaptApiPersonToPerson) : [],
    [rawPeople],
  );

  const existingMemberIds = useMemo(() => {
    return new Set(department.members?.map((m) => m.person?.id) || []);
  }, [department]);

  const availablePeople = useMemo(() => {
    return people.filter((p) => !existingMemberIds.has(p.id));
  }, [people, existingMemberIds]);

  const handleSelectPerson = (p: IPerson) => {
    setSelectedPerson(p);
    setValue("personId", p.id, { shouldDirty: true, shouldValidate: true });
  };

  const handleClearPerson = () => {
    setSelectedPerson(null);
    setValue("personId", "", { shouldDirty: true, shouldValidate: true });
  };

  const isPending = isLoading || formState.isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <div className="space-y-4">
        {/* Person Selector */}
        <Controller
          name="personId"
          control={control}
          render={({ fieldState: { error } }) => (
            <FormField
              id="department-person-search"
              label="Select Person"
              required
              error={error?.message}
            >
              {selectedPerson ? (
                <div className="p-3 rounded-xl bg-primary-soft border border-primary-border flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {getInitials(selectedPerson.name)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-fg">
                        {selectedPerson.name}
                      </p>
                      <p className="text-2xs text-fg-muted">
                        {selectedPerson.email || selectedPerson.phone}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-2xs py-1 px-2.5"
                    onClick={handleClearPerson}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-fg-subtle absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search congregation by name, email, or phone..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border-control bg-surface text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl border border-border-subtle p-1 bg-subtle">
                    {isSearching ? (
                      <p className="p-3 text-2xs text-fg-muted text-center italic">
                        Searching directory...
                      </p>
                    ) : availablePeople.length > 0 ? (
                      availablePeople.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectPerson(p)}
                          className="w-full p-2 rounded-lg text-left hover:bg-surface flex items-center justify-between text-xs transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary-soft text-primary-text font-bold text-2xs flex items-center justify-center">
                              {getInitials(p.name)}
                            </div>
                            <div>
                              <p className="font-semibold text-fg">{p.name}</p>
                              <p className="text-2xs text-fg-muted">
                                {p.email || p.phone}
                              </p>
                            </div>
                          </div>
                          <StatusBadge status={p.membershipStatus} size="sm" />
                        </button>
                      ))
                    ) : (
                      <p className="p-3 text-2xs text-fg-muted text-center italic">
                        {searchTerm
                          ? "No matching unassigned members found"
                          : "Type a name to search congregation members"}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </FormField>
          )}
        />

        {/* Role input with chips */}
        <Controller
          name="role"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <div className="space-y-1.5">
              <Input
                {...field}
                label="Department Role / Title"
                placeholder="e.g. Lead, Assistant Lead, Sound Engineer"
                error={error?.message}
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {COMMON_ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setValue("role", r, { shouldDirty: true })}
                    className={`px-2 py-0.5 rounded-md text-2xs font-medium transition-colors cursor-pointer ${
                      field.value === r
                        ? "bg-primary text-white"
                        : "bg-muted hover:bg-muted-strong text-fg-secondary"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
        />
      </div>

      <FormFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => guard(onCancel)}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isPending}
          disabled={!selectedPerson}
        >
          Assign Member
        </Button>
      </FormFooter>
    </form>
  );
};
