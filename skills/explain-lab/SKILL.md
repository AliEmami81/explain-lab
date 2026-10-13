---
name: explain-lab
description: Build an interactive teaching lab for a concept, algorithm, or system. Use when the user wants to learn by changing inputs, stepping through behavior, and testing a prediction rather than only reading an explanation.
---
# ExplainLab

Turn the requested concept into an experiment the learner can control. The lab
must teach an observable relationship, not decorate a static explanation.

## Choose the model

Identify the learner's question and one prediction they can test. State the model,
units and assumptions. When comparing strategies, reuse the same input and seed;
vary only the strategy. Distinguish simulated counts from runtime benchmarks.

Read [the lab contract](references/lab-contract.md) when planning the artifact.
For runnable examples, inspect this repository's `core.js`, `app.js` and
`index.html` at the repository root. If only this skill folder is installed,
the contract is sufficient to build an independent lab; the examples are optional.

## Build and check

Prefer a local HTML/CSS/JavaScript artifact unless the user requests another
format. Keep the simulation logic separate from rendering. Include controls that
change a meaningful model parameter, reset, pause/step and a readable outcome.
Animation should visualize actual state; it must not substitute for the model.

Verify invariants with executable tests. Use at least one hand-computable example,
an edge case and a counterexample to a likely misconception. Inspect the rendered
artifact at desktop and narrow widths and exercise the controls. Pause animation
when the page is hidden. Respect reduced-motion preferences by not auto-playing.

## Deliver

Explain what the learner should notice, where the model simplifies reality and
which checks ran. Include a reproducible input or seed. New topics require the
agent to implement and test a model; this package does not generate arbitrary
simulations without an agent. Publishing or uploading is outside this skill's
scope unless the user authorizes it.
