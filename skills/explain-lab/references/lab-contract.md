# A lab that teaches

Use these as design criteria, not a fixed page template.

- **Question:** something the learner can answer after changing a control.
- **Model:** states, transitions, units, constraints and a termination condition.
- **Fair comparison:** the same workload and seed for both strategies.
- **Controls:** expose meaningful parameters; bound invalid or expensive inputs.
- **Inspection:** a stepper and an outcome that correspond to actual state.
- **Prediction:** invite a guess before revealing the outcome.
- **Evidence:** hand-worked examples, invariants and deterministic replay checks.
- **Limits:** name what the model omits; do not present a simulation as a real-world
  measurement or use a byte/count metric as a model-token or latency estimate.

For sorting, the final multiset and ascending order are invariants. During
insertion, a key may be held outside the array: show that fact explicitly.
For pathfinding, validate path adjacency and total cost. Equal edge weights should
make BFS and Dijkstra agree on optimal cost, though not necessarily on the path.

Deliver offline assets without mandatory CDNs. Avoid evaluating user code or
using unsanitized HTML. A downloadable experiment should include model inputs,
strategy identifiers and output metrics; do not include private source material
unless it is part of the user's requested artifact.
