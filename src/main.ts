import './style.css';
import allWords from "./words.json";
let words = allWords;

(function() {

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

  const nw = words.slice(0, 100);
  // Initial App Setup
  let cur_guess = {
    word: "",
    correctness: new Array(5).fill(0)
  }
  const boxes = document.querySelectorAll(".guess-container > div");
  const results_div = document.querySelector(".results")!;
  const mode_btn = document.querySelector(".mode > button")!;
  const search_box = document.querySelector(".search > input") as HTMLInputElement;
  const word_ct = document.querySelector(".word-count") as HTMLSpanElement;

  // need to enter search mode when search is focused
  mode_btn.addEventListener("click", () => { setSearchMode(!searchMode); })

  search_box.addEventListener("focusin", () => {
    if (!searchMode) setSearchMode(true)
  });
  search_box.addEventListener("focusout", () => {
    if (searchMode) setSearchMode(false)
  });
  search_box.addEventListener("input", () => {
    const query = search_box.value.toLowerCase();
    const w = words.filter(word => word.includes(query))
    renderWords(w)
  })



  renderWords(words);
  boxes.forEach((box, box_idx) => {
    box.addEventListener("click", () => {
      cur_guess.correctness[box_idx] = (cur_guess.correctness[box_idx] + 1) % 3;
      box.setAttribute("data-correctness", cur_guess.correctness[box_idx].toString());
    })
  })

  document.addEventListener("keydown", e => {
    const key = e.key.toLowerCase();

    if (e.shiftKey && key == "tab") {
      e.preventDefault();
      setSearchMode(!searchMode);
    }

    if (searchMode) return

    e.preventDefault();
    if (key.length === 1 && key >= 'a' && key <= 'z') { handleKey(key); }
    if (key === 'enter') { handleKey('enter'); }
    if (key === 'backspace') { handleKey('del'); }
  })

  document.querySelectorAll(".keyboard > .keyboard-row > button").forEach(btn => {
    if (!(btn instanceof HTMLElement)) { return; }
    const key = btn.dataset.key;
    if (key === undefined) { console.log('ERROR: Set key data val'); return; }
    btn.addEventListener("click", () => handleKey(key))
  })

  function handleKey(key: string) {
    if (key === "enter") {
      if (cur_guess.word.length !== 5) {
        alert("Your guess must be of length 5")
        return;
      }

      filterWords(cur_guess);
      renderWords(words);

      cur_guess = {
        word: "",
        correctness: new Array(5).fill(5)
      }
      boxes.forEach((box, box_idx) => box.setAttribute("data-correctness", cur_guess.correctness[box_idx]))
      updateGuess(cur_guess.word);
    } else if (key === "del") {
      if (cur_guess.word.length === 0) { return; }
      cur_guess.word = cur_guess.word.slice(0, cur_guess.word.length - 1);
      updateGuess(cur_guess.word);
    } else {
      if (cur_guess.word.length === 5) { return; }

      cur_guess.word = cur_guess.word + key;
      updateGuess(cur_guess.word);
    }
  }

  function setSearchMode(val: boolean) {
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

  function updateGuess(word: string) {
    let ct = 0;
    for (let i = 0; i < word.length; i++) {
      boxes[i].innerHTML = word[i];
      ct++;
    }

    for (ct; ct < 5; ct++) {
      boxes[ct].innerHTML = "";
    }
  }

  function filterWords(g: Guess) {
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

  function renderWords(words: string[]) {
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
