import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MessageTemplateFilterParams,
  messageTemplateService,
} from "@/services/messageTemplate.service";
import {
  CreateMessageTemplatePayload,
  UpdateMessageTemplatePayload,
} from "@/models/outreach";
import { customToast } from "@/helpers/customToast";

export function useMessageTemplates(params?: MessageTemplateFilterParams) {
  return useQuery({
    queryKey: ["message-templates", params],
    queryFn: () => messageTemplateService.list(params),
  });
}

export function useCreateMessageTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMessageTemplatePayload) =>
      messageTemplateService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-templates"] });
      customToast.success("Message template created successfully");
    },
    onError: (err: unknown) => {
      const errorObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const msg =
        errorObj?.response?.data?.message ||
        errorObj?.message ||
        "Failed to create template";
      customToast.error(msg);
    },
  });
}

export function useUpdateMessageTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateMessageTemplatePayload;
    }) => messageTemplateService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-templates"] });
      customToast.success("Message template updated successfully");
    },
    onError: (err: unknown) => {
      const errorObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const msg =
        errorObj?.response?.data?.message ||
        errorObj?.message ||
        "Failed to update template";
      customToast.error(msg);
    },
  });
}

export function useDeleteMessageTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => messageTemplateService.remove(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["message-templates"] });
      if (data?.action === "deactivated") {
        customToast.success(
          "Template is referenced in sent messages, so it was deactivated instead of deleted",
        );
      } else {
        customToast.success("Message template deleted successfully");
      }
    },
    onError: (err: unknown) => {
      const errorObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const msg =
        errorObj?.response?.data?.message ||
        errorObj?.message ||
        "Failed to delete template";
      customToast.error(msg);
    },
  });
}

export function usePreviewTemplateBody() {
  return useMutation({
    mutationFn: (body: string) => messageTemplateService.previewBody(body),
  });
}
