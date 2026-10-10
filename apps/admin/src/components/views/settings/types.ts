import { IChurchSettings } from "@/models/dashboard";

/** Shared props for the sections that edit the church settings form. */
export interface SettingsSectionProps {
  value: IChurchSettings;
  onChange: (next: IChurchSettings) => void;
}
