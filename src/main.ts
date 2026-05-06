import './style.css';
import words from "./words.json";

(function() {

  // [x] - Collect keyboard events
  // [] - Handle displayed key button presses
  // [] - Change color of guess boxed on click
  // [] - Filter available words
  // [] - Display available words
  //  [] - Virtual scrolling
  // [] - On click result, add to guess jar
  interface Guess {
    value: string;
    correctness: number[];
  }

  // Initial App Setup
  let guess = "";
  let guesses: Guess[] = [];
  let correctness = new Array(5).fill(0);
  const boxes = document.querySelectorAll(".guess-container > div");


  boxes.forEach((box, box_idx) => {
    box.addEventListener("click", () => {
      correctness[box_idx] = (correctness[box_idx] + 1) % 3;
      box.setAttribute("data-correctness", correctness[box_idx].toString());
    })
  })
  document.addEventListener("keydown", e => {
    e.preventDefault();
    const key = e.key.toLowerCase();
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
      if (guess.length !== 5) {
        alert("Your guess must be of length 5")
        return;
      }

      const last_guess = {
        value: guess,
        correctness,
      }
      filterWords(last_guess);
    } else if (key === "del") {
      if (guess.length === 0) { return; }
      guess = guess.slice(0, guess.length - 1);
    } else {
      if (guess.length === 5) { return; }

      guess = guess + key;
      updateGuess(guess);
    }
  }

  function updateGuess(guess: string) {
    let ct = 0;
    for (let i = 0; i < guess.length; i++) {
      boxes[i].innerHTML = guess[i];
      ct++;
    }

    for (ct; ct < guess.length; ct++) {
      boxes[ct].innerHTML = "";
    }
  }

  function filterWords(g: Guess) {
    words.filter(word => {
      for (let i = 0; i < g.value.length; i++) {
        // remove words with grey letter
        if (g.correctness[i] === 0 && word.includes(g.value[i])) { return false; }

        if (g.correctness[i] === 1) {
          // make sure word doesn't have a yellow letter in same idx
          if (word[i] === g.value[i]) { return false; }
          // make sure word includes yellow letter
          if (!word.includes(g.value[i])) { return false; }
        }

        // make sure word has green letter in proper place
        if (g.correctness[i] === 2 && word[i] !== g.value[i]) { return false; }
      }
    })

    // word has passed all filter checks
    return true;
  }
})();
