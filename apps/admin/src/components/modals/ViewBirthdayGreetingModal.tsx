"use client";

import React from "react";
import {
  Mail,
  Phone,
  Calendar,
  MailCheck,
  User,
  ExternalLink,
  Cake,
  Send,
} from "lucide-react";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { NotAvailable } from "@/components/ui/NotAvailable";
import { TruncatedTextWithCopy } from "@/helpers/TruncatedTextWithCopy";
import { BirthdayPersonItem } from "@/models/birthday";
import { useAuth } from "@/hooks/useAuth";
import { getUserRoles, ROLES } from "@/utils/rbac";
import dayjs from "dayjs";

interface ViewBirthdayGreetingModalProps {
  person: BirthdayPersonItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSendGreeting?: (person: BirthdayPersonItem) => void;
}

export const ViewBirthdayGreetingModal: React.FC<
  ViewBirthdayGreetingModalProps
> = ({ person, isOpen, onClose, onSendGreeting }) => {
  const { user } = useAuth();
  const userRoles = getUserRoles(user);
  const isSuperAdmin = userRoles.includes(ROLES.SUPER_ADMIN);

  if (!person) return null;

  const greeting = person.greeting;
  const fullName = `${person.firstName} ${person.lastName}`.trim();
  const initials = `${person.firstName?.[0] || ""}${
    person.lastName?.[0] || ""
  }`.toUpperCase();

  const senderName = greeting?.sentBy
    ? `${greeting.sentBy.firstName || ""} ${greeting.sentBy.lastName || ""}`.trim() ||
      greeting.sentBy.email ||
      "Church Admin"
    : "Church Admin";

  const sentAtFormatted = greeting?.sentAt
    ? dayjs(greeting.sentAt).format("MMMM D, YYYY [at] h:mm A")
    : null;

  const birthdayFormatted =
    person.birthdayDate || person.dateOfBirth
      ? dayjs(person.birthdayDate || person.dateOfBirth).format("MMMM D, YYYY")
      : null;

  return (
    <SidebarModal
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose}>
            Close
          </Button>
          {person.email && onSendGreeting && (
            <Button
              variant="primary"
              type="button"
              onClick={() => {
                onClose();
                onSendGreeting(person);
              }}
              rightIcon={<Send className="w-3.5 h-3.5" />}
            >
              Send Another Greeting
            </Button>
          )}
        </>
      }
      title={fullName}
      description={`Birthday Outreach Record • ID: ${person.id}`}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="space-y-5">
        {/* Header Profile Card */}
        <div className="p-4 rounded-2xl bg-primary-soft border border-primary-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-primary text-white font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
              {initials || <Cake className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-fg truncate">{fullName}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <StatusBadge
                  status={person.membershipStatus || "MEMBER"}
                  size="sm"
                />
                {isSuperAdmin &&
                  person.turningAge !== undefined &&
                  person.turningAge !== null && (
                    <span className="text-2xs font-semibold text-primary-text">
                      Turning {person.turningAge}
                    </span>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Audit Status Card */}
        <div className="rounded-xl border border-success-border bg-success-soft p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-success-text">
            <MailCheck className="w-4 h-4 text-success-text shrink-0" />
            <span>Greeting Successfully Delivered</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-fg-secondary">
            <div className="flex items-center gap-1.5 min-w-0">
              <User className="w-3.5 h-3.5 text-fg-subtle shrink-0" />
              <span className="truncate">
                Sent by:{" "}
                <strong className="font-semibold text-fg">{senderName}</strong>
              </span>
            </div>
            {sentAtFormatted && (
              <div className="flex items-center gap-1.5 min-w-0">
                <Calendar className="w-3.5 h-3.5 text-fg-subtle shrink-0" />
                <span className="truncate">{sentAtFormatted}</span>
              </div>
            )}
          </div>
        </div>

        {/* Member Contact Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-subtle border border-border">
            <p className="text-2xs text-fg-muted font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
              <Mail className="w-3 h-3 text-fg-subtle" />
              Email Address
            </p>
            {person.email ? (
              <TruncatedTextWithCopy
                text={person.email}
                maxLength={24}
                textClassName="font-semibold text-fg"
              />
            ) : (
              <NotAvailable />
            )}
          </div>

          <div className="p-3 rounded-xl bg-subtle border border-border">
            <p className="text-2xs text-fg-muted font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
              <Phone className="w-3 h-3 text-fg-subtle" />
              Phone Number
            </p>
            {person.phone ? (
              <p className="font-semibold text-fg truncate">{person.phone}</p>
            ) : (
              <NotAvailable />
            )}
          </div>

          <div className="p-3 rounded-xl bg-subtle border border-border col-span-1 sm:col-span-2">
            <p className="text-2xs text-fg-muted font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
              <Calendar className="w-3 h-3 text-fg-subtle" />
              Birthday Date
            </p>
            <p className="font-semibold text-fg">
              {birthdayFormatted || <NotAvailable />}
            </p>
          </div>
        </div>

        {/* Sent Greeting Message Card */}
        {greeting ? (
          <div className="space-y-4 rounded-xl border border-border bg-subtle p-4">
            {/* Subject */}
            <div>
              <label className="text-2xs font-bold uppercase tracking-wider text-fg-subtle">
                Email Subject Line
              </label>
              <p className="text-sm font-semibold text-fg mt-0.5 break-words">
                {greeting.subject}
              </p>
            </div>

            {/* Banner Heading */}
            {greeting.heading && (
              <div>
                <label className="text-2xs font-bold uppercase tracking-wider text-fg-subtle">
                  Banner Heading
                </label>
                <p className="text-sm font-medium text-fg mt-0.5 break-words">
                  {greeting.heading}
                </p>
              </div>
            )}

            {/* Flyer Image Graphic */}
            {greeting.imageUrl && (
              <div>
                <label className="text-2xs font-bold uppercase tracking-wider text-fg-subtle block mb-1.5">
                  Birthday Card Flyer
                </label>
                <div className="rounded-lg overflow-hidden border border-border-control bg-surface max-h-56">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={greeting.imageUrl}
                    alt="Birthday Card"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Message Body */}
            <div>
              <label className="text-2xs font-bold uppercase tracking-wider text-fg-subtle block mb-1.5">
                Message Content
              </label>
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-xs text-fg-secondary p-3.5 rounded-lg bg-surface border border-border leading-relaxed break-words [word-break:break-word] overflow-x-auto [&_p]:my-1.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_img]:max-w-full [&_table]:max-w-full [&_table]:w-full"
                dangerouslySetInnerHTML={{ __html: greeting.message }}
              />
            </div>

            {/* CTA Button */}
            {greeting.ctaLabel && greeting.ctaUrl && (
              <div className="pt-2 border-t border-border-control flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs text-fg-muted">Call to Action:</span>
                <a
                  href={greeting.ctaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary-soft text-primary-text hover:bg-primary-border transition-colors break-all"
                >
                  <span>{greeting.ctaLabel}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-fg-muted">
            No greeting content payload attached to this record.
          </div>
        )}
      </div>
    </SidebarModal>
  );
};
