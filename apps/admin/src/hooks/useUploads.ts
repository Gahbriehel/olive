import { useIsMutating, useMutation } from "@tanstack/react-query";

const UPLOAD_FLYER_KEY = ["upload-flyer"];
import { uploadsService } from "@/services/uploads.service";

/** Image upload; resolves to the hosted URL. No success toast: the preview is the feedback. */
export function useUploadFlyer() {
  const mutation = useMutation({
    mutationKey: UPLOAD_FLYER_KEY,
    mutationFn: (file: File) => uploadsService.uploadFlyer(file),
  });
  return {
    uploadFlyer: mutation.mutateAsync,
    isUploadingFlyer: mutation.isPending,
  };
}

/** True while any flyer upload is in flight, e.g. to disable a form's submit. */
export function useIsUploadingFlyer() {
  return useIsMutating({ mutationKey: UPLOAD_FLYER_KEY }) > 0;
}
