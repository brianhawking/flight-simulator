import { useMemo, useState } from "react";
import { useSimulationSession } from "../engine/simulation/useSimulationSession";
import {
  acknowledgeIncident,
  canOpenMonitoring,
  createInitialNavigationState,
  openMonitoring,
  resetNavigationForScenario,
  selectSurface,
} from "../engine/navigation/navigation";
import { buildIncidentPresentation } from "./buildIncidentPresentation";
import { buildScenarioOptions } from "./buildScenarioOptions";
import { SimulatorShell } from "./SimulatorShell";
import { SurfaceRouter } from "./SurfaceRouter";

export default function App() {
  const [selectedScenarioId, setSelectedScenarioId] = useState("generated-backend-timeout");
  const [navigation, setNavigation] = useState(createInitialNavigationState);

  const scenarioOptions = useMemo(() => buildScenarioOptions(), []);

  const activeOption =
    scenarioOptions.find((entry) => entry.id === selectedScenarioId) ?? scenarioOptions[0];
  const simulationSession = useSimulationSession(activeOption.simulationSource);
  const visibleEvidence = simulationSession.visibleEvidence;
  const incident = buildIncidentPresentation(activeOption.evidencePackage, navigation.acknowledged);
  const monitoringAvailable = canOpenMonitoring(navigation);

  return (
    <SimulatorShell
      selectedScenarioId={selectedScenarioId}
      scenarioOptions={scenarioOptions}
      activeSurface={navigation.surface}
      severity={incident.severity}
      monitoringAvailable={monitoringAvailable}
      currentTime={simulationSession.currentTime}
      isPlaying={simulationSession.isPlaying}
      speed={simulationSession.speed}
      onSelectScenario={(scenarioId) => {
        setSelectedScenarioId(scenarioId);
        setNavigation(resetNavigationForScenario());
      }}
      onSelectSurface={(surface) =>
        setNavigation((previous) => selectSurface(previous, surface))
      }
      onPause={simulationSession.pause}
      onPlay={simulationSession.play}
      onReset={simulationSession.reset}
      onSetSpeed={simulationSession.setSpeed}
    >
      <SurfaceRouter
        surface={navigation.surface}
        incident={incident}
        currentTime={simulationSession.currentTime}
        acknowledged={navigation.acknowledged}
        monitoringVisited={navigation.monitoringVisited}
        visibleEvidence={visibleEvidence}
        onOpenIncident={() => setNavigation((previous) => selectSurface(previous, "pagerduty"))}
        onAcknowledge={() => setNavigation((previous) => acknowledgeIncident(previous))}
        onOpenMonitoring={() => setNavigation((previous) => openMonitoring(previous))}
      />
    </SimulatorShell>
  );
}
