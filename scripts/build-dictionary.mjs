import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const WORD_LIST_URL =
  "https://raw.githubusercontent.com/tabatkins/wordle-list/main/words";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, "..", "public", "wordle-dictionary.json");

async function main() {
  console.log(`Fetching word list from ${WORD_LIST_URL}...`);

  const res = await fetch(WORD_LIST_URL);
  if (!res.ok) {
    console.error(
      `Failed to fetch word list: ${res.status} ${res.statusText}`,
    );
    console.error(
      "You can manually provide a newline-separated word list at scripts/words-snapshot.txt",
    );
    process.exit(1);
  }

  const text = await res.text();
  const words = text
    .split("\n")
    .map((w) => w.trim().toLowerCase())
    .filter((w) => /^[a-z]{5}$/.test(w));

  words.sort();
  const unique = [...new Set(words)];

  writeFileSync(OUTPUT_PATH, JSON.stringify(unique));

  const sizeKB = (Buffer.byteLength(JSON.stringify(unique)) / 1024).toFixed(1);
  console.log(`Wrote ${unique.length} words to public/wordle-dictionary.json (${sizeKB} KB)`);
}

main();
