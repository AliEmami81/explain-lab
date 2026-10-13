const test = require('node:test');
const assert = require('node:assert/strict');
const lab = require('../core.js');
test('seeded inputs replay exactly; different seeds change the input', () => {
  assert.deepEqual(lab.values(18, 42), lab.values(18, 42));
  assert.notDeepEqual(lab.values(18, 42), lab.values(18, 43));
  assert.deepEqual(lab.terrain(9), lab.terrain(9));
});
test('both sorts preserve the input and end in sorted order across duplicates and random seeds', () => {
  for (const algorithm of ['bubble', 'insertion']) for (let seed = 0; seed < 25; seed++) {
    const input = lab.values(18, seed), copy = [...input];
    const frames = lab.sorting(input, algorithm), final = frames.at(-1);
    assert.deepEqual(input, copy);
    assert.deepEqual(final.values, [...input].sort((a, b) => a - b));
    for (let i = 1; i < frames.length; i++) assert.ok(frames[i].comparisons >= frames[i - 1].comparisons && frames[i].writes >= frames[i - 1].writes);
  }
});
test('sorted inputs need n-1 comparisons and bubble performs no array writes', () => {
  for (const algorithm of ['bubble', 'insertion']) assert.equal(lab.sorting([1, 2, 3, 4], algorithm).at(-1).comparisons, 3);
  assert.equal(lab.sorting([1, 2, 3], 'bubble').at(-1).writes, 0);
  assert.deepEqual(lab.sorting([], 'insertion').at(-1).values, []);
});
test('Dijkstra chooses a lower-cost route even when BFS takes fewer steps', () => {
  const grid = { width: 3, height: 2, cells: [1, 9, 1, 1, 1, 1], start: 0, goal: 2 };
  const bfs = lab.route(grid, 'bfs'), weighted = lab.route(grid, 'dijkstra');
  assert.equal(bfs.steps, 2); assert.equal(bfs.cost, 10);
  assert.equal(weighted.steps, 4); assert.equal(weighted.cost, 4);
});
test('uniform grids agree on optimal cost; paths remain contiguous, traversable and correctly priced', () => {
  for (let seed = 0; seed < 30; seed++) {
    const grid = lab.terrain(seed, false), a = lab.route(grid, 'bfs'), b = lab.route(grid, 'dijkstra');
    assert.equal(a.cost, b.cost); assert.ok(a.path.length);
    for (const id of b.path) assert.ok(grid.cells[id] > 0);
    for (let i = 1; i < b.path.length; i++) {
      const prev = b.path[i - 1], next = b.path[i];
      assert.equal(Math.abs(prev % grid.width - next % grid.width) + Math.abs(Math.floor(prev / grid.width) - Math.floor(next / grid.width)), 1);
    }
    assert.equal(b.cost, b.path.slice(1).reduce((sum, id) => sum + grid.cells[id], 0));
  }
});
test('unreachable goals and start==goal have explicit results', () => {
  for (const algorithm of ['bfs', 'dijkstra']) {
    const no = lab.route({ width: 3, height: 1, cells: [1, 0, 1], start: 0, goal: 2 }, algorithm);
    assert.deepEqual(no.path, []); assert.equal(no.cost, null);
    const one = lab.route({ width: 1, height: 1, cells: [2], start: 0, goal: 0 }, algorithm);
    assert.deepEqual(one.path, [0]); assert.equal(one.cost, 0);
  }
});
test('invalid inputs are rejected rather than animated', () => {
  assert.throws(() => lab.sorting([NaN], 'bubble'));
  assert.throws(() => lab.sorting([1], 'unknown'));
  assert.throws(() => lab.values(100, 4));
  assert.throws(() => lab.route({ width: 2, height: 1, cells: [1, -2], start: 0, goal: 1 }, 'dijkstra'));
});
test('weighted routes are never more expensive than the BFS route on the same terrain', () => {
  for (let seed = 0; seed < 50; seed++) {
    const grid = lab.terrain(seed), a = lab.route(grid, 'bfs'), b = lab.route(grid, 'dijkstra');
    assert.ok(a.path.length && b.path.length); assert.ok(b.cost <= a.cost);
  }
});
