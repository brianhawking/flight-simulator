export type Surface = "slack" | "pagerduty" | "monitoring";

export type SimulatorNavigationState = {
  surface: Surface;
  acknowledged: boolean;
  monitoringVisited: boolean;
};

export function createInitialNavigationState(): SimulatorNavigationState {
  return {
    surface: "slack",
    acknowledged: false,
    monitoringVisited: false,
  };
}

export function openPagerDuty(
  state: SimulatorNavigationState,
): SimulatorNavigationState {
  return {
    ...state,
    surface: "pagerduty",
  };
}

export function acknowledgeIncident(
  state: SimulatorNavigationState,
): SimulatorNavigationState {
  return {
    ...state,
    acknowledged: true,
  };
}

export function canOpenMonitoring(state: SimulatorNavigationState) {
  return state.acknowledged;
}

export function openMonitoring(
  state: SimulatorNavigationState,
): SimulatorNavigationState {
  if (!canOpenMonitoring(state)) {
    return state;
  }

  return {
    ...state,
    surface: "monitoring",
    monitoringVisited: true,
  };
}

export function selectSurface(
  state: SimulatorNavigationState,
  surface: Surface,
): SimulatorNavigationState {
  if (surface === "monitoring") {
    return openMonitoring(state);
  }

  if (surface === "pagerduty") {
    return openPagerDuty(state);
  }

  return {
    ...state,
    surface,
  };
}

export function resetNavigationForScenario(): SimulatorNavigationState {
  return createInitialNavigationState();
}
