import { useMutation } from "@tanstack/react-query";
import { uploadsService } from "@/services/uploads.service";

/** Image upload; resolves to the hosted URL. No success toast: the preview is the feedback. */
export function useUploadFlyer() {
  const mutation = useMutation({
    mutationFn: (file: File) => uploadsService.uploadFlyer(file),
  });
  return {
    uploadFlyer: mutation.mutateAsync,
    isUploadingFlyer: mutation.isPending,
  };
}
