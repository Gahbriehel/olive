"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";

export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/settings?tab=profile");
  }, [router]);

  return (
    <div className="flex h-64 items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
