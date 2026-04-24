
async function main() {
  // find wordle js bundle
  //  - find substring
  //  - back up and expand to full URL
  //  - verify a js file
  // get source
  // extract words

  // const WORDLE_URL = "https://www.nytimes.com/games/wordle/index.html";
  const BUNDLE_SRCH_STR = "https://www.nytimes.com/games-assets/v2/wordle";

  const response = await fetch(WORDLE_URL);
  const html = await response.text();

  builtin(html, BUNDLE_SRCH_STR);
}

function builtin(str: string, src: string) {
  // need to perform multiple times until .js found
  let idx_start = str.indexOf(src);
  let bundle_url = null;

  while (idx_start !== -1) {
    let idx_end = -1
    for (let i = idx_start; i < str.length; i++) {
      if (str[i] == "\"") {
        idx_end = i;
        break;
      }
    }

    bundle_url = str.slice(idx_start, idx_end);
    if (bundle_url.slice(-3) === ".js") {
      break;
    }

    str = str.slice(idx_end);
    idx_start = str.indexOf(src)
  }

  if (bundle_url?.slice(-3) !== ".js") { console.log("Can't find bundle url"); return; }
  console.log(bundle_url);
}

main();
