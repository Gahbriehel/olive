"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getDefaultRouteForUser } from "@/utils/rbac";
import { Spinner } from "@/components/ui/Spinner";

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      const defaultRoute = getDefaultRouteForUser(user);
      router.replace(defaultRoute);
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="text-center space-y-3">
        <Spinner size="lg" className="mx-auto" />
        <p className="text-sm text-slate-400 font-medium">Redirecting...</p>
      </div>
    </div>
  );
}
