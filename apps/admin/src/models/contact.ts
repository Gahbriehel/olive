import { type BadgeVariant } from "@/components/ui/Badge";
import { type PrayerCategory, type InquiryCategory } from "@olive/types";
import { IBaseResponse } from "./base";

export interface IContactResponse extends IBaseResponse {
  data: {
    items: IContact[];
  };
}

export interface IContact {
  id: string;
  type: string;
  name: string;
  email: string;
  phone?: string | null;
  category: PrayerCategory | InquiryCategory | string;
  message: string;
  isPrivate?: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export function getContactCategoryColor(
  category?: PrayerCategory | InquiryCategory | string | null,
): BadgeVariant {
  if (!category) return "slate";
  switch (category) {
    // Prayer Categories
    case "Healing & Health":
      return "rose";
    case "Family & Marriage":
      return "purple";
    case "Financial Breakthrough":
      return "emerald";
    case "Spiritual Growth":
      return "indigo";
    case "General Prayer":
      return "slate";

    // Inquiry Categories
    case "Directions":
      return "cyan";
    case "Partnership & Giving":
      return "gold";
    case "Pastoral Counseling":
      return "purple";
    case "Baptism":
      return "blue";
    case "Child Dedication":
      return "amber";
    case "Media & Technical Support":
      return "indigo";
    case "General Question":
      return "slate";

    default:
      return "slate";
  }
}
