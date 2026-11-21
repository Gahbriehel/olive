import type { Metadata } from "next";
import { Suspense } from "react";
import { GiveView } from "@/components/give/GiveView";

export const metadata: Metadata = {
  title: "Give",
  description:
    "Give your tithes, offerings and seeds to Abiding Word Of Grace Missions by bank transfer.",
};

export default function GivePage() {
  // useSearchParams in GiveView needs a Suspense boundary for static rendering.
  return (
    <Suspense fallback={null}>
      <GiveView />
    </Suspense>
  );
}
