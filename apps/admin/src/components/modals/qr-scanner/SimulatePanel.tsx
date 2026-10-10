"use client";

import React from "react";
import { TeamBadge } from "@/components/ui/TeamBadge";
import { IRegistration } from "@/types/dashboard";

interface SimulatePanelProps {
  registrations: IRegistration[];
  onPick: (registrationNumber: string) => void;
}

/** Dev/test helper: "scan" a pending registrant with one click. */
export function SimulatePanel({ registrations, onPick }: SimulatePanelProps) {
  return (
    <div className="space-y-2">
      <p className="font-bold text-fg-secondary">
        Quick Test Simulation (Pending Registrants):
      </p>
      <div className="space-y-1.5 max-h-56 overflow-y-auto">
        {registrations.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onPick(r.registrationNumber)}
            className="w-full p-2.5 rounded-xl border border-border hover:border-success-border hover:bg-success-soft text-left flex items-center justify-between transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <div>
              <span className="font-bold text-fg">{r.name}</span>
              <span className="text-2xs text-fg-muted ml-2">
                ({r.registrationNumber})
              </span>
            </div>
            {r.team?.name && (
              <TeamBadge color={r.team.colorHex}>{r.team.name}</TeamBadge>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
