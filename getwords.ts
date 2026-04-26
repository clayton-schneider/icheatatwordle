import { writeFileSync } from "fs";

async function main() {

  const WORDLE_URL = "https://www.nytimes.com/games/wordle/index.html";
  const CHUNK_TXT = "https://www.nytimes.com/games-assets/v2/"

  const response = await fetch(WORDLE_URL);
  let html = await response.text();

  // Find first chunk
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

  const REGEX = /\["[a-z]{5}"(?:,"[a-z]{5}")+\]/
  let words;
  for (const url of chunk_urls) {
    let match = null;
    if (url.slice(-3) !== ".js") { continue; }
    const js_res = await fetch(url);
    let js_text = await js_res.text();
    match = js_text.match(REGEX);
    if (match) {
      words = match[0];
      break;
    }
  }
  if (!words) { console.log("No word array found"); return; }
  writeFileSync("src/words.json", words);
}


main();
