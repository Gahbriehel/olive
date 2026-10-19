import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IDepartment,
  ICreateDepartmentPayload,
  IUpdateDepartmentPayload,
  IAssignDepartmentMemberPayload,
} from "@/models/department";
import { departmentService } from "@/services/department.service";

const EMPTY_DEPARTMENTS: IDepartment[] = [];

export function useDepartments() {
  const queryClient = useQueryClient();

  const departmentsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentService.getDepartments(),
    staleTime: 1000 * 60 * 3,
  });

  const createDepartmentMutation = useMutation({
    meta: { successMessage: "Department created successfully" },
    mutationFn: (dto: ICreateDepartmentPayload) =>
      departmentService.createDepartment(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });

  const updateDepartmentMutation = useMutation({
    meta: { successMessage: "Department updated successfully" },
    mutationFn: ({ id, dto }: { id: string; dto: IUpdateDepartmentPayload }) =>
      departmentService.updateDepartment(id, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["department", variables.id] });
    },
  });

  const deleteDepartmentMutation = useMutation({
    meta: { successMessage: "Department deleted successfully" },
    mutationFn: (id: string) => departmentService.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });

  const addMemberMutation = useMutation({
    meta: { successMessage: "Member assigned to department" },
    mutationFn: ({
      departmentId,
      dto,
    }: {
      departmentId: string;
      dto: IAssignDepartmentMemberPayload;
    }) => departmentService.addMember(departmentId, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({
        queryKey: ["department", variables.departmentId],
      });
      queryClient.invalidateQueries({ queryKey: ["people"] });
      queryClient.invalidateQueries({
        queryKey: ["person", variables.dto.personId],
      });
    },
  });

  const removeMemberMutation = useMutation({
    meta: { successMessage: "Person removed from department" },
    mutationFn: ({
      departmentId,
      personId,
    }: {
      departmentId: string;
      personId: string;
    }) => departmentService.removeMember(departmentId, personId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({
        queryKey: ["department", variables.departmentId],
      });
      queryClient.invalidateQueries({ queryKey: ["people"] });
      queryClient.invalidateQueries({
        queryKey: ["person", variables.personId],
      });
    },
  });

  return {
    departments: departmentsQuery.data || EMPTY_DEPARTMENTS,
    isLoading: departmentsQuery.isLoading,
    isError: departmentsQuery.isError,
    error: departmentsQuery.error,
    refetch: departmentsQuery.refetch,
    createDepartment: createDepartmentMutation.mutateAsync,
    isCreating: createDepartmentMutation.isPending,
    updateDepartment: updateDepartmentMutation.mutateAsync,
    isUpdating: updateDepartmentMutation.isPending,
    deleteDepartment: deleteDepartmentMutation.mutateAsync,
    isDeleting: deleteDepartmentMutation.isPending,
    addMember: addMemberMutation.mutateAsync,
    isAddingMember: addMemberMutation.isPending,
    removeMember: removeMemberMutation.mutateAsync,
    isRemovingMember: removeMemberMutation.isPending,
  };
}

export function useDepartment(id?: string) {
  return useQuery({
    queryKey: ["department", id],
    queryFn: () => departmentService.getDepartmentById(id as string),
    staleTime: 1000 * 60,
    enabled: Boolean(id),
  });
}
