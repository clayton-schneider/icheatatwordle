import { getChunkUrls, seq_fetch, concurrent_fetch } from './getwords.ts';

const RUNS = 5;

async function measure(label: string, fn: () => Promise<unknown>) {
  const times: number[] = [];
  for (let i = 0; i < RUNS; i++) {
    const t0 = performance.now();
    await fn();
    times.push(performance.now() - t0);
  }
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  console.log(`${label}: avg ${avg.toFixed(1)}ms over ${RUNS} runs (${times.map(t => t.toFixed(0)).join(', ')}ms)`);
}

const urls = await getChunkUrls();

await measure('Sequential ', () => seq_fetch(urls));
await measure('Concurrent ', () => concurrent_fetch(urls));
