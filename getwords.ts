import { writeFileSync } from "fs";

const REGEX = /\["[a-z]{5}"(?:,"[a-z]{5}")+\]/

export async function getChunkUrls(): Promise<string[]> {
  const WORDLE_URL = "https://www.nytimes.com/games/wordle/index.html";
  const CHUNK_TXT = "https://www.nytimes.com/games-assets/v2/"

  const response = await fetch(WORDLE_URL);
  let html = await response.text();

  let idx_start = html.indexOf(CHUNK_TXT);
  const chunk_urls: string[] = []

  while (idx_start !== -1) {
    let idx_end = -1
    for (let i = idx_start; i < html.length; i++) {
      if (html[i] == "\"") {
        idx_end = i;
        break;
      }
    }

    let bundle_url = html.slice(idx_start, idx_end);
    chunk_urls.push(bundle_url);

    html = html.slice(idx_end);
    idx_start = html.indexOf(CHUNK_TXT);
  }

  return chunk_urls;
}

async function main() {
  const chunk_urls = await getChunkUrls();
  const words = await concurrent_fetch(chunk_urls);
  if (!words) { console.log("No word array found"); return; }
  writeFileSync("src/words.json", words);
}

export async function seq_fetch(urls: string[]) {
  for (const url of urls) {
    let match = null;
    if (url.slice(-3) !== ".js") { continue; }
    const js_res = await fetch(url);
    let js_text = await js_res.text();
    match = js_text.match(REGEX);
    if (match) {
      return match[0];
    }
  }
  return null;
}

export async function concurrent_fetch(urls: string[]) {
  const words = await Promise.all(
    urls.map(async (url) => {
      const res_txt = await (await fetch(url)).text();
      return res_txt.match(REGEX);
    })
  ).then(results => results.find(r => r !== null))
  return words === undefined ? null : words[0];
}

main();
