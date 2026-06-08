# Incident Response Training Simulator

An Incident Response Training Simulator for mobile engineers.

The product simulates separate operational tools like Slack, PagerDuty, and New Relic-style monitoring so trainees can practice:

- incident response
- investigation
- communication
- escalation

The current app is intentionally data-driven. Trainee-facing evidence is rendered from stable contracts rather than AI runtime decisions.

## Architecture

Primary live architecture:

```text
ScenarioModel
→ MetricStreams + TimeIndexedEvents
→ EvidenceViewBuilder(currentTime)
→ EvidencePackage
→ UI Surfaces
```

Current static fallback path:

```text
ScenarioModel
→ RuleBasedEvidenceGenerator
→ EvidencePackage
→ UI Surfaces
```

Why both paths exist today:

- `Backend Timeout` is the first fully stream/event-backed scenario.
- `Mobile Enum Mapping` and `Discover Offer Activation` still use the static/generated path while the live architecture is expanded incrementally.

## Folder Structure

```text
src/
├── app/
├── domain/
├── engine/
├── features/
└── test/
```

### `src/app`

React app entry, shell orchestration, and global styling.

Examples:

- app bootstrap
- top-level shell components
- scenario option construction
- shared presentation helpers

### `src/domain`

Stable domain contracts and authored fixtures.

Examples:

- `ScenarioModel`
- `EvidencePackage`
- `MetricStream` and `TimeIndexedEvent` types
- authored scenarios
- authored evidence packages

### `src/engine`

Runtime logic and simulation behavior.

Examples:

- simulation session / clock
- navigation state
- metric stream generation
- time-indexed event generation
- evidence view building
- rule-based evidence generation

### `src/features`

UI surfaces only.

Examples:

- Slack
- PagerDuty
- New Relic-style Monitoring

### `src/test`

Shared test helpers and reusable assertions.

## Important Contracts

### `ScenarioModel`

Incident truth and training intent.

It describes:

- incident type
- signals
- affected segments
- learning goals
- expected evidence families
- expected actions

It should not contain rendered chart points, rendered logs, or UI-specific evidence payloads.

### `MetricStreams`

Time-varying system behavior.

Examples:

- success rate over time
- latency over time
- status code counts over time

These are the foundation for making the simulator feel alive.

### `TimeIndexedEvents`

Time-aware incident events that can appear during playback.

Examples:

- logs
- traces
- timeline markers

### `EvidencePackage`

The trainee-visible evidence projection used by the UI.

Examples:

- charts
- summary cards
- breakdowns
- logs
- traces
- timeline markers

`EvidencePackage` is the UI contract.

### UI Surfaces

Slack, PagerDuty, and Monitoring should consume:

- `EvidencePackage`
- small neutral presentation models

They should not read `ScenarioModel` directly for trainee-facing evidence.

## Current Scenario Support

### Backend Timeout / API Outage

Status: stream/event-backed

Path:

```text
ScenarioModel
→ MetricStreams + TimeIndexedEvents
→ EvidenceViewBuilder
→ EvidencePackage
→ UI
```

### Mobile Enum Mapping / Client Decoding Issue

Status: static/generated

Path:

```text
ScenarioModel
→ RuleBasedEvidenceGenerator
→ EvidencePackage
→ UI
```

### Discover Offer Activation / Product Eligibility Issue

Status: static/generated

Path:

```text
ScenarioModel
→ RuleBasedEvidenceGenerator
→ EvidencePackage
→ UI
```

## Development Commands

Install dependencies:

```bash
npm install
```

Run tests:

```bash
npm test
```

Build for production:

```bash
npx vite build
```

Run the dev server:

```bash
npm run dev
```

## Design Principles

- Do not let the UI read `ScenarioModel` directly for trainee-facing evidence.
- Do not put root cause or diagnosis into Slack/PagerDuty trainee views.
- Keep `EvidencePackage` as the UI contract.
- Use streams and time-indexed events for live simulation behavior.
- Keep Claude/AI out of runtime truth.
- Add tests around contracts, generated evidence, and simulation behavior.

## Current Limitations / Next Steps

- Mobile and Discover are not stream/event-backed yet.
- Slack and PagerDuty are still lightweight compared to real tools.
- Monitoring is New Relic-inspired, not pixel-perfect.
- No scoring yet.
- No Claude-driven stakeholders yet.

## Contributor Guidance

When adding new simulator behavior:

1. Start with domain truth in `ScenarioModel`.
2. Prefer generating streams/events instead of hardcoding rendered evidence.
3. Project trainee-visible state into `EvidencePackage`.
4. Keep Slack/PagerDuty neutral and spoiler-free.
5. Add tests at the contract seam you are changing.
