import './style.css'

(function() {

  // [x] - Collect keyboard events
  // [] - Handle displayed key button presses
  // [] - Change color of guess boxed on click
  // [] - Filter available words
  // [] - Display available words
  //  [] - Virtual scrolling
  // [] - On click result, add to guess jar

  // Initial App Setup
  let guess = "";
  let guesses = [];
  const boxes = document.querySelectorAll(".guess-container > div");

  document.addEventListener("keydown", e => {
    e.preventDefault();
    const key = e.key.toLowerCase();
    if (key.length === 1 && key >= 'a' && key <= 'z') { handleKey(key) }

    if (key === 'enter') { console.log('enter pressed') }
    if (key === 'backspace') { handleKey('del') }
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
    } else if (key === "del") {
      if (guess.length === 0) { return; }
      guess = guess.slice(0, guess.length - 1);
    } else {
      if (guess.length === 5) { return; }

      guess = guess + key;
    }
    updateGuess(guess);
  }

  function updateGuess(guess: string) {
    let ct = 0
    for (let i = 0; i < guess.length; i++) {
      boxes[i].innerHTML = guess[i];
      ct++;
    }

    for (ct; ct < 5; ct++) {
      boxes[ct].innerHTML = "";
    }

  }
})();
