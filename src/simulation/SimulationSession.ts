import { EvidencePackage } from "../types/evidence";
import { MetricStreamBundle, TimeIndexedEvent } from "../types/metrics";
import { ScenarioModel } from "../types/scenario";

export const SIMULATION_REAL_TICK_MS = 250;
export const SIMULATED_MS_PER_REAL_MS_AT_1X = 60;
export const DEFAULT_SIMULATION_SPEED = 1;
export const SIMULATION_SPEED_OPTIONS = [1, 2, 4] as const;

export type SimulationSpeed = (typeof SIMULATION_SPEED_OPTIONS)[number];

export type SimulationSession = {
  evidencePackage: EvidencePackage;
  currentTime: string;
  isPlaying: boolean;
  speed: SimulationSpeed;
  visibleEvidence: EvidencePackage;
  play: () => void;
  pause: () => void;
  reset: () => void;
  setSpeed: (speed: SimulationSpeed) => void;
};

export type SimulationEvidenceSource =
  | {
      mode: "static";
      evidencePackage: EvidencePackage;
    }
  | {
      mode: "stream";
      scenario: ScenarioModel;
      metricStreams: MetricStreamBundle;
      timeIndexedEvents: TimeIndexedEvent[];
    };
