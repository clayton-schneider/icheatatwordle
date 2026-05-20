import './style.css';
import allWords from "./words.json";
let words = allWords;

(function() {
  // UI
  //  Current Guess
  //  Search
  //  Available Guesses
  //  Keyboard
  //  Light/Dark Mode
  //
  //  Connection - UI to Core
  //
  // Core
  //  Reset
  //  Guess Tracking
  //  Available Words
  //  Search Mode
  //    - Word filtering

  // [] - Handle displayed key button presses
  // [] - Filter available words
  // [] - Display available words
  //  [] - Virtual scrolling
  // [] - On click result, add to guess jar
  interface Guess {
    word: string;
    correctness: number[];
  }


  let searchMode = false;

  // Initial App Setup
  let cur_guess = {
    word: "",
    correctness: new Array(5).fill(0)
  }
  const boxes = document.querySelectorAll<HTMLDivElement>(".guess-container > div")!;
  const results_div = document.querySelector<HTMLDivElement>(".results")!;
  const mode_btn = document.querySelector<HTMLButtonElement>(".mode > button")!;
  const search_box = document.querySelector<HTMLInputElement>(".search > input")!;
  const word_ct = document.querySelector<HTMLSpanElement>(".word-count")!;

  mode_btn.addEventListener("click", () => { set_search_mode(!searchMode); })

  search_box.addEventListener("focusin", () => {
    if (!searchMode) set_search_mode(true)
  });
  search_box.addEventListener("focusout", () => {
    if (searchMode) set_search_mode(false)
  });
  search_box.addEventListener("input", () => {
    const query = search_box.value.toLowerCase();
    const w = words.filter(word => word.includes(query))
    render_words(w)
  })



  render_words(words);
  boxes.forEach((box, box_idx) => {
    box.addEventListener("click", () => {
      cycle_box_correctness(box, box_idx)
    })
  })

  function cycle_box_correctness(box_elem: HTMLDivElement, box_idx: number) {
    cur_guess.correctness[box_idx] = (cur_guess.correctness[box_idx] + 1) % 3;
    box_elem.setAttribute("data-correctness", cur_guess.correctness[box_idx].toString());
  }

  document.addEventListener("keydown", e => {
    const key = e.key.toLowerCase();

    if (e.shiftKey && key == "tab") {
      e.preventDefault();
      set_search_mode(!searchMode);
    }

    if (searchMode) return

    e.preventDefault();
    if (key.length === 1 && key >= 'a' && key <= 'z') { handle_key(key); }
    if (key === 'enter') { handle_key('enter'); }
    if (key === 'backspace') { handle_key('del'); }
  })

  document.querySelectorAll(".keyboard > .keyboard-row > button").forEach(btn => {
    if (!(btn instanceof HTMLElement)) { return; }
    const key = btn.dataset.key;
    if (key === undefined) { console.log('ERROR: Set key data val'); return; }
    btn.addEventListener("click", () => handle_key(key))
  })

  function handle_key(key: string) {
    if (key === "enter") {
      if (cur_guess.word.length !== 5) {
        alert("Your guess must be of length 5")
        return;
      }

      reduce_words(cur_guess);
      render_words(words);

      cur_guess = {
        word: "",
        correctness: new Array(5).fill(5)
      }
      boxes.forEach((box, box_idx) => box.setAttribute("data-correctness", cur_guess.correctness[box_idx]))
      update_guess(cur_guess.word);
    } else if (key === "del") {
      if (cur_guess.word.length === 0) { return; }
      cur_guess.word = cur_guess.word.slice(0, cur_guess.word.length - 1);
      update_guess(cur_guess.word);
    } else {
      if (cur_guess.word.length === 5) { return; }

      cur_guess.word = cur_guess.word + key;
      update_guess(cur_guess.word);
    }
  }

  function set_search_mode(val: boolean) {
    searchMode = val;
    if (val) {
      mode_btn.textContent = "Search Mode";
      mode_btn.setAttribute("data-mode", "search")
      search_box.focus();
    } else {
      mode_btn.textContent = "Enter Mode";
      mode_btn.setAttribute("data-mode", "enter")
      search_box.blur();
    }
  }

  function update_guess(word: string) {
    let ct = 0;
    for (let i = 0; i < word.length; i++) {
      boxes[i].innerHTML = word[i];
      ct++;
    }

    for (ct; ct < 5; ct++) {
      boxes[ct].innerHTML = "";
    }
  }

  function reduce_words(g: Guess) {
    words = words.filter(word => {
      for (let i = 0; i < g.word.length; i++) {
        // remove words with grey letter
        if (g.correctness[i] === 0 && word.includes(g.word[i])) { return false; }

        if (g.correctness[i] === 1) {
          // make sure word doesn't have a yellow letter in same idx
          if (word[i] === g.word[i]) { return false; }
          // make sure word includes yellow letter
          if (!word.includes(g.word[i])) { return false; }
        }

        // make sure word has green letter in proper place
        if (g.correctness[i] === 2 && word[i] !== g.word[i]) { return false; }
      }
      // word has passed all filter checks
      return true;
    })
  }

  function render_words(words: string[]) {
    word_ct.innerText = words.length.toString();
    results_div.innerHTML = "";
    words.forEach(w => {
      const wrap_div = document.createElement('div');
      wrap_div.className = "result";
      wrap_div.innerHTML = `<p>${w}</p><p>Use →</p>`;
      results_div.appendChild(wrap_div);
    })
  }
})();
