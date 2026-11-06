import { Badge } from "@/components/ui/Badge";
import {
  CONFESSION_VOICES,
  ConfessionListItem,
  ConfessionVoice,
} from "@/models/confession";
import { VOICE_LABEL, VOICE_SHORT } from "./confessionUtils";

type Props = Pick<ConfessionListItem, "audio" | "audioStale">;

function badgeFor(voice: ConfessionVoice, { audio, audioStale }: Props) {
  if (!audio?.[voice]) return { variant: "slate" as const, text: "None" };
  if (audioStale?.[voice])
    return { variant: "amber" as const, text: "Out of Date" };
  return { variant: "emerald" as const, text: "OK" };
}

export function AudioStatusBadges(props: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {CONFESSION_VOICES.map((voice) => {
        const { variant, text } = badgeFor(voice, props);
        return (
          <Badge
            key={voice}
            size="sm"
            variant={variant}
            title={`${VOICE_LABEL[voice]} voice: ${text}`}
          >
            {VOICE_SHORT[voice]} · {text}
          </Badge>
        );
      })}
    </div>
  );
}
