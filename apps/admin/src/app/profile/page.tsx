"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/ui/Spinner";

export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/settings?tab=profile");
  }, [router]);

  return <LoadingState label="Opening your profile..." className="h-64" />;
}
