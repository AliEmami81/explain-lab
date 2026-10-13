(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ExplainLab = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function random(seed) {
    let state = Number(seed) >>> 0;
    return () => { state = (Math.imul(1664525, state) + 1013904223) >>> 0; return state / 4294967296; };
  }
  function values(count, seed, pattern = 'random') {
    if (!Number.isInteger(count) || count < 2 || count > 48) throw Error('Choose 2–48 values.');
    const rng = random(seed);
    const list = Array.from({ length: count }, () => 5 + Math.floor(rng() * 95));
    if (pattern === 'reversed') list.sort((a, b) => b - a);
    if (pattern === 'nearly') { list.sort((a, b) => a - b); [list[0], list[1]] = [list[1], list[0]]; }
    return list;
  }
  function sorting(input, algorithm) {
    if (!Array.isArray(input) || input.length > 48 || input.some(x => !Number.isFinite(x))) throw Error('Expected up to 48 finite numbers.');
    if (!['bubble', 'insertion'].includes(algorithm)) throw Error('Unknown sorting algorithm.');
    const list = input.slice(), frames = [];
    let comparisons = 0, writes = 0;
    const frame = (active, note, held = null) => frames.push({ values: list.slice(), active, note, comparisons, writes, held });
    frame([], 'Both algorithms start with the same values.');
    if (algorithm === 'bubble') {
      for (let end = list.length - 1; end > 0; end--) {
        let swapped = false;
        for (let i = 0; i < end; i++) {
          comparisons++;
          if (list[i] > list[i + 1]) {
            [list[i], list[i + 1]] = [list[i + 1], list[i]]; writes += 2; swapped = true;
            frame([i, i + 1], 'Swap adjacent values; the larger value moves right.');
          } else frame([i, i + 1], 'Compare adjacent values; this pair is already ordered.');
        }
        if (!swapped) break;
      }
    } else {
      for (let i = 1; i < list.length; i++) {
        const key = list[i]; let j = i - 1;
        while (j >= 0) {
          comparisons++;
          if (list[j] <= key) { frame([j, i], 'The insertion position has been found.', key); break; }
          list[j + 1] = list[j]; writes++;
          frame([j, j + 1], 'Shift a larger value right. The insertion key is temporarily held aside.', key); j--;
        }
        list[j + 1] = key; writes++;
        frame([j + 1], 'Place the held value into the sorted prefix.');
      }
    }
    frame([], 'Complete. Every value is in ascending order.');
    return frames;
  }
  function terrain(seed, weighted = true) {
    const rng = random(seed), width = 12, height = 8;
    const cells = Array.from({ length: width * height }, () => rng() < 0.15 ? 0 : weighted && rng() < 0.35 ? 7 : 1);
    // A guaranteed traversable route; deliberately expensive when weights are enabled.
    for (let x = 0; x < width; x++) cells[x] = weighted && x > 0 && x < width - 1 ? 7 : 1;
    for (let y = 0; y < height; y++) cells[y * width + width - 1] = 1;
    cells[0] = 1; cells[cells.length - 1] = 1;
    return { width, height, cells, start: 0, goal: cells.length - 1 };
  }
  function route(grid, algorithm) {
    const { width, height, cells, start, goal } = grid;
    if (!['bfs', 'dijkstra'].includes(algorithm)) throw Error('Unknown path algorithm.');
    if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width * height !== cells?.length || cells.length > 2000 || cells.some(x => !Number.isFinite(x) || x < 0) || !Number.isInteger(start) || !Number.isInteger(goal) || start < 0 || goal < 0 || start >= cells.length || goal >= cells.length || cells[start] === 0 || cells[goal] === 0) throw Error('Invalid positive-weight grid. Zero represents a wall.');
    const distances = new Map([[start, 0]]), previous = new Map(), frontier = [start], visited = new Set(), frames = [];
    let found = false;
    const snapshot = (current, path = []) => frames.push({ current, visited: [...visited], frontier: [...frontier], path, found: path.length > 0 });
    snapshot(null);
    while (frontier.length) {
      if (algorithm === 'dijkstra') frontier.sort((a, b) => distances.get(a) - distances.get(b) || a - b);
      const id = frontier.shift();
      if (visited.has(id)) continue;
      visited.add(id);
      if (id === goal) { found = true; snapshot(id); break; }
      const x = id % width, y = Math.floor(id / width);
      const neighbors = [[x + 1, y], [x, y + 1], [x - 1, y], [x, y - 1]];
      for (const [nx, ny] of neighbors) {
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const next = ny * width + nx;
        if (!cells[next] || visited.has(next)) continue;
        const cost = distances.get(id) + (algorithm === 'bfs' ? 1 : cells[next]);
        if (!distances.has(next) || cost < distances.get(next)) {
          distances.set(next, cost); previous.set(next, id);
          if (!frontier.includes(next)) frontier.push(next);
        }
      }
      snapshot(id);
    }
    const trail = [];
    if (found) { for (let id = goal; id !== undefined; id = previous.get(id)) trail.push(id); trail.reverse(); }
    snapshot(null, trail);
    return { frames, path: trail, steps: trail.length ? trail.length - 1 : null, cost: trail.length ? trail.slice(1).reduce((n, id) => n + cells[id], 0) : null, explored: visited.size };
  }
  return { random, values, sorting, terrain, route };
});
