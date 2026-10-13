'use strict';
(() => {
  const $ = id => document.getElementById(id), api = ExplainLab;
  const el = (tag, text, cls) => { const n = document.createElement(tag); if (text !== undefined) n.textContent = text; if (cls) n.className = cls; return n; };
  let mode = 'sorting', step = 0, traces, inputs, timer = null;
  const query = new URLSearchParams(location.search);
  if (query.get('lab') === 'path') mode = 'path';
  if (/^\d{1,6}$/.test(query.get('seed') || '')) $('seed').value = query.get('seed');
  function stop() { clearInterval(timer); timer = null; $('play').textContent = '▶ Run experiment'; }
  function maxStep() { return Math.max(...traces.map(t => t.frames.length)) - 1; }
  function reset() {
    stop(); step = 0;
    const parsed = Number($('seed').value);
    const seed = Number.isFinite(parsed) ? Math.min(999999, Math.max(0, Math.floor(parsed))) : 42;
    $('seed').value = seed;
    if (mode === 'sorting') {
      const list = api.values(18, seed, $('pattern').value);
      inputs = { mode, seed, pattern: $('pattern').value, values: list };
      traces = ['bubble', 'insertion'].map(algorithm => ({ algorithm, frames: api.sorting(list, algorithm) }));
    } else {
      const grid = api.terrain(seed, $('terrain').value === 'weighted');
      inputs = { mode, seed, terrain: $('terrain').value, grid };
      traces = ['bfs', 'dijkstra'].map(algorithm => ({ algorithm, ...api.route(grid, algorithm) }));
    }
    $('sorting-tab').classList.toggle('active', mode === 'sorting'); $('sorting-tab').setAttribute('aria-pressed', String(mode === 'sorting'));
    $('path-tab').classList.toggle('active', mode === 'path'); $('path-tab').setAttribute('aria-pressed', String(mode === 'path'));
    $('pattern-wrap').hidden = mode !== 'sorting'; $('weight-wrap').hidden = mode !== 'path';
    const copy = mode === 'sorting' ? ['EXPERIMENT 01 / SORTING', 'Same values. Different decisions.', 'Bubble sort', 'Insertion sort', 'Which algorithm will need fewer comparisons? Try a nearly sorted input.', 'The input changes the story.', 'Insertion sort works through a growing sorted prefix. Bubble sort compares neighboring values. Change the starting order and compare the counters. A step is an algorithm event, not a unit of runtime; these counts are not a speed benchmark.'] : ['EXPERIMENT 02 / PATHFINDING', 'The shortest path can cost more.', 'Breadth-first search', 'Dijkstra’s algorithm', 'Gold cells cost 7 to enter; light cells cost 1. Will the fewest steps also be the cheapest route?', 'Define what “shortest” means.', 'BFS minimizes the number of edges on this four-direction grid. Dijkstra minimizes total entry cost for positive weights. Start-cell cost is excluded. Try equal travel costs: the optimal cost should then agree, even if tie-breaking chooses different routes. Walls are blocked; every generated map has a route.'];
    ['lab-kicker', 'lab-title', 'name-a', 'name-b', 'prediction', 'takeaway-title', 'takeaway'].forEach((id, i) => $(id).textContent = copy[i]);
    $('progress').max = maxStep(); render();
  }
  function metric(value, name) { const n = el('div', undefined, 'metric'); n.append(el('b', value), el('span', name)); return n; }
  function render() {
    $('progress').value = step; $('step-count').textContent = `Step ${step} / ${maxStep()}`;
    traces.forEach((trace, i) => {
      const side = i === 0 ? 'a' : 'b', frame = trace.frames[Math.min(step, trace.frames.length - 1)], scene = $('scene-' + side);
      const done = step >= trace.frames.length - 1;
      scene.replaceChildren(); scene.className = 'scene' + (mode === 'path' ? ' grid-scene' : '');
      $('status-' + side).textContent = done ? 'COMPLETE' : step ? 'IN PROGRESS' : 'READY';
      $('metrics-' + side).replaceChildren();
      if (mode === 'sorting') {
        frame.values.forEach((value, index) => { const bar = el('div', undefined, 'bar' + (frame.active.includes(index) ? ' active' : '')); bar.style.height = Math.max(5, value) + '%'; bar.append(el('span', value)); scene.append(bar); });
        $('metrics-' + side).append(metric(frame.comparisons, 'COMPARISONS'), metric(frame.writes, 'ARRAY WRITES'));
        $('note-' + side).textContent = frame.note + (frame.held === null ? '' : ` Held value: ${frame.held}.`);
      } else {
        const { grid } = inputs, visited = new Set(frame.visited), frontier = new Set(frame.frontier), trail = new Set(frame.path);
        grid.cells.forEach((weight, index) => {
          const cls = ['cell', !weight ? 'wall' : weight > 1 ? 'weighted' : '', visited.has(index) ? 'visited' : '', frontier.has(index) ? 'frontier' : '', trail.has(index) ? 'path' : '', index === grid.start || index === grid.goal ? 'endpoint' : ''].join(' ');
          const cell = el('div', index === grid.start ? 'S' : index === grid.goal ? 'G' : weight > 1 ? weight : '', cls);
          cell.title = `Cell ${index}: ${weight ? 'entry cost ' + weight : 'wall'}`; scene.append(cell);
        });
        $('metrics-' + side).append(metric(frame.visited.length, 'EXPLORED'), metric(done ? trace.steps ?? 'No route' : '—', 'PATH STEPS'), metric(done ? trace.cost ?? '—' : '—', 'TRAVEL COST'));
        $('note-' + side).textContent = done ? 'Dark green marks the chosen path. Gold = cost 7; light = cost 1; dark gray = wall.' : 'Green = explored. Lime = frontier. S = start, G = goal. Four-direction moves only.';
      }
    });
    if (step >= maxStep()) stop();
  }
  $('play').addEventListener('click', () => {
    if (timer) return stop();
    if (step >= maxStep()) step = 0;
    $('play').textContent = 'Ⅱ Pause'; timer = setInterval(() => { step++; render(); }, 95);
  });
  $('step').addEventListener('click', () => { stop(); step = Math.min(maxStep(), step + 1); render(); });
  $('progress').addEventListener('input', () => { stop(); step = Number($('progress').value); render(); });
  $('reset').addEventListener('click', reset);
  for (const id of ['seed', 'pattern', 'terrain']) $(id).addEventListener('change', reset);
  $('sorting-tab').addEventListener('click', () => { mode = 'sorting'; reset(); });
  $('path-tab').addEventListener('click', () => { mode = 'path'; reset(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  $('download').addEventListener('click', () => {
    const data = { schemaVersion: 1, ...inputs, results: traces.map(t => mode === 'sorting' ? { algorithm: t.algorithm, ...t.frames.at(-1) } : { algorithm: t.algorithm, path: t.path, cost: t.cost, steps: t.steps, explored: t.explored }) };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const a = el('a'); a.href = url; a.download = `explain-lab-${mode}-${inputs.seed}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  reset();
})();
