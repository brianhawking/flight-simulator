import { EvidencePackage } from "../../types/evidence";
import { TimelineHint } from "../../types/scenario";
import { addMinutes } from "../generatorUtils";

export function generateTimelineMarkers(
  startTime: Date,
  timelineHints: TimelineHint[],
): EvidencePackage["timelineMarkers"] {
  return timelineHints.map((hint) => ({
    id: hint.id,
    timestamp: addMinutes(startTime, hint.minuteOffset).toISOString(),
    label: hint.label,
    category: hint.category,
  }));
}
