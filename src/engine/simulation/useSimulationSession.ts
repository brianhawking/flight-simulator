import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_SIMULATION_SPEED,
  SIMULATED_MS_PER_REAL_MS_AT_1X,
  SIMULATION_REAL_TICK_MS,
  SimulationEvidenceSource,
  SimulationSession,
  SimulationSpeed,
} from "./SimulationSession";
import { filterEvidenceForTime } from "./filterEvidenceForTime";
import { buildEvidenceView } from "../generation/EvidenceViewBuilder";

export function useSimulationSession(source: SimulationEvidenceSource): SimulationSession {
  const evidencePackage = useMemo(() => {
    if (source.mode === "stream") {
      return buildEvidenceView({
        scenario: source.scenario,
        metricStreams: source.metricStreams,
        timeIndexedEvents: source.timeIndexedEvents,
        currentTime: source.metricStreams.window.end,
      });
    }

    return source.evidencePackage;
  }, [source]);
  const startTimeMs = useMemo(
    () =>
      source.mode === "stream"
        ? Date.parse(source.metricStreams.window.start)
        : Date.parse(source.evidencePackage.window.start),
    [source],
  );
  const endTimeMs = useMemo(
    () =>
      source.mode === "stream"
        ? Date.parse(source.metricStreams.window.end)
        : Date.parse(source.evidencePackage.window.end),
    [source],
  );

  const [currentTimeMs, setCurrentTimeMs] = useState(startTimeMs);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeedState] = useState<SimulationSpeed>(DEFAULT_SIMULATION_SPEED);

  useEffect(() => {
    setCurrentTimeMs(startTimeMs);
    setIsPlaying(false);
  }, [evidencePackage.id, startTimeMs]);

  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setCurrentTimeMs((previousTimeMs) => {
        const stepMs = Math.round(
          SIMULATION_REAL_TICK_MS * SIMULATED_MS_PER_REAL_MS_AT_1X * speed,
        );
        const nextTimeMs = Math.min(previousTimeMs + stepMs, endTimeMs);

        if (nextTimeMs >= endTimeMs) {
          setIsPlaying(false);
        }

        return nextTimeMs;
      });
    }, SIMULATION_REAL_TICK_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [endTimeMs, isPlaying, speed]);

  const currentTime = useMemo(
    () => new Date(currentTimeMs).toISOString(),
    [currentTimeMs],
  );
  const visibleEvidence = useMemo(
    () => buildVisibleEvidenceForSession(source, currentTime),
    [currentTime, source],
  );

  return {
    evidencePackage,
    currentTime,
    isPlaying,
    speed,
    visibleEvidence,
    play: () => {
      if (currentTimeMs < endTimeMs) {
        setIsPlaying(true);
      }
    },
    pause: () => {
      setIsPlaying(false);
    },
    reset: () => {
      setIsPlaying(false);
      setCurrentTimeMs(startTimeMs);
    },
    setSpeed: (nextSpeed: SimulationSpeed) => {
      setSpeedState(nextSpeed);
    },
  };
}

export function buildVisibleEvidenceForSession(
  source: SimulationEvidenceSource,
  currentTime: string,
) {
  if (source.mode === "stream") {
    return buildEvidenceView({
      scenario: source.scenario,
      metricStreams: source.metricStreams,
      timeIndexedEvents: source.timeIndexedEvents,
      currentTime,
    });
  }

  return filterEvidenceForTime(source.evidencePackage, currentTime);
}
