<p align="center"><strong>e × EXPLAINLAB KIT</strong></p>
<h1 align="center">Don't just explain it.<br>Let me change it.</h1>
<p align="center">Interactive algorithm experiments + a reusable agent skill.<br>Predict, step through real state, and see why an outcome changes.</p>
<p align="center"><a href="https://aliemami81.github.io/explain-lab/">Open the labs ↗</a> · <a href="#use-the-agent-skill">Use the skill</a> · <a href="#how-the-models-work">Models & limits</a></p>
<p align="center"><a href="https://github.com/AliEmami81/explain-lab/actions/workflows/tests.yml"><img src="https://github.com/AliEmami81/explain-lab/actions/workflows/tests.yml/badge.svg" alt="Tests"></a> <img src="https://img.shields.io/badge/runtime-browser-244b3b" alt="Runs in your browser"> <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-244b3b" alt="MIT license"></a></p>

![ExplainLab sorting experiment](assets/preview.png)

## Try it

**[Open the live demo](https://aliemami81.github.io/explain-lab/)** — no account, API key or model call.

Or clone the repository and open `index.html` directly in a modern browser:

```sh
git clone https://github.com/AliEmami81/explain-lab.git
cd explain-lab
```

There are no runtime packages, CDNs or build steps. If you prefer a local server,
run `npm run dev` with Node.js 22+ and open `http://127.0.0.1:4173`.

## Two experiments, a shared idea

| Lab | Compare | Change | Discover |
| --- | --- | --- | --- |
| Sorting race | Bubble sort and insertion sort | Input seed and starting order | Comparisons and array writes depend on the input |
| Pathfinding | BFS and Dijkstra | Input seed and uniform/mixed terrain costs | Fewest steps and lowest travel cost are different objectives |

Use **Step** for one event, **Run** to animate, and the timeline to inspect any
recorded state. Reset preserves the input. Export an experiment as JSON containing
the actual inputs and complete-run output metrics, independent of the current
timeline position. Both strategies use the same generated input.

The pathfinding lab can be opened with a reproducible seed:

```text
https://aliemami81.github.io/explain-lab/?lab=path&seed=42
```

## Use the agent skill

Copy the entire [`skills/explain-lab`](skills/explain-lab) folder into the skill
directory supported by your coding agent. Keep `SKILL.md` and `references/`
together. This repository does not automatically install or modify your agent.

Then ask your agent:

> Use the explain-lab skill to build an interactive lab about cache replacement.
> Compare LRU and FIFO on the same request stream. Include a prediction, a
> stepper, a reset button, and deterministic checks.

Other good requests: a round-robin scheduler, rate limiting with token buckets,
or how a hash table resolves collisions. The skill guides the agent to define a
model, build actual simulation logic, test invariants, and explain limits.

**The site ships two working labs.** New topics require a coding agent to write
and verify a new model. The browser app does not call an AI service or generate
arbitrary simulations on its own. Your chosen agent's normal access and usage
limits still apply.

## How the models work

### Sorting

An 18-value array is generated using a deterministic 32-bit linear congruential
generator. Both algorithms receive copies of that array. Bubble sort stops early
when a pass makes no swaps. Insertion sort holds a key aside while shifting larger
values; the step note explicitly shows the held value during those transitions.
Final order preserves the input multiset.

Counters record value comparisons and array writes in these implementations.
They do not measure CPU time, agent tokens, energy or asymptotic performance.
Steps are algorithm events; a step in one algorithm is not a matched unit of work
in the other. Temporary insertion-array states can contain a duplicate while the
held key is outside the array; the final multiset is preserved.

### Pathfinding

A generated 12×8 grid has four-direction movement, blocked cells and positive
entry costs of 1 or 7. A traversable route is guaranteed. BFS minimizes the number
of edges and ignores weights when choosing a route. Dijkstra minimizes the sum of
entry costs. The start cell's cost is excluded. Tie-breaking is deterministic.

The Dijkstra implementation uses a sorted array frontier for clarity, not a
production priority queue. Explored-node counts describe these runs and are not a
runtime benchmark. Uniform weights should make both algorithms agree on optimal
cost, though not necessarily on the chosen route.

![ExplainLab pathfinding experiment](assets/pathfinding.png)

## Build another lab

`core.js` contains pure model functions and can be loaded in the browser or with
Node's `require`. `app.js` renders traces; `style.css` and `index.html` are ordinary
static assets. No frameworks or remote fonts are required.

```js
const { sorting, terrain, route } = require('./core.js');
const trace = sorting([4, 1, 3], 'insertion');
console.log(trace.at(-1).values); // [1, 3, 4]
const result = route(terrain(42), 'dijkstra');
console.log(result.steps, result.cost);
```

To add a concept, define a bounded input, a state transition, a meaningful control
and a testable invariant. Start with a hand-computable case. Prefer a useful
counterexample over decorative animation.

## Validation

```sh
npm test
```

Eight test groups cover deterministic inputs, final sort order and preservation,
counter monotonicity, a weighted-path counterexample, uniform-grid agreement,
path validity, unreachable goals, start=goal and invalid inputs. Randomized cases
use fixed seeds for replay. CI runs on Windows/Linux with Node.js 22/24.

Desktop and narrow-screen rendering and the controls have been checked in an
isolated headless browser. The labs do not auto-play and pause when the page is
hidden. No network requests are needed after loading the static assets.

## Contributing and background

Focused labs with a real misconception, documented assumptions and deterministic
checks are welcome. Include the teaching question, model and validation in a PR.
AI-assisted contributions are welcome when their behavior and tests are explained.
Do not add unsupported scientific or performance claims.

This is an independent **ExplainLab Kit** project. A separately maintained
[ExplainLab](https://github.com/zhzhg-dev/explainlab) explores distributed-systems
failure modes; this repository is not affiliated with it. The shared idea of
interactive explanations also appears in tools such as
[Archify](https://github.com/tt-a1i/archify). No code or assets were copied from
those projects.

MIT © Ali Emami
