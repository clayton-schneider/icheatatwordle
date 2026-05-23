import './style.css';
import all_words from "./words.json";

(function() {

  interface Guess {
    word: string;
    correctness: number[];
  }

  interface Guess_Constraints {
    greens: Array<string | undefined>;
    yellows: Map<number, string>;
    min_counts: Map<string, number>;
    max_counts: Map<string, number>;
  }


  const ROW_HEIGHT = 64;
  const BUFFER_ROWS = 75;

  let search_mode = false;
  let candidate_words = all_words;
  let visible_words: string[] = candidate_words;
  let render_scheduled = false;
  const guessed_letters = new Map<string, number>();

  // Initial App Setup
  let cur_guess = {
    word: "",
    correctness: new Array(5).fill(0)
  }
  const boxes = document.querySelectorAll<HTMLDivElement>(".guess-container > div")!;
  const results_div = document.querySelector<HTMLDivElement>(".results")!;
  const results_spacer = document.querySelector<HTMLDivElement>(".results-spacer")!;
  const results_window = document.querySelector<HTMLDivElement>(".results-window")!;
  const mode_btn = document.querySelector<HTMLButtonElement>(".mode-button")!;
  const reset_btn = document.querySelector<HTMLButtonElement>(".reset-button")!;
  const theme_toggle = document.querySelector<HTMLButtonElement>(".theme-toggle")!;
  const search_box = document.querySelector<HTMLInputElement>(".search > input")!;
  const word_ct = document.querySelector<HTMLSpanElement>(".word-count")!;

  apply_theme(localStorage.getItem("theme") === "light" ? "light" : "dark");

  results_div.addEventListener("scroll", schedule_virtual_render);
  results_div.addEventListener("click", e => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    const add_button = target.closest<HTMLElement>("[data-word]");
    if (add_button === null) return;

    cur_guess.word = add_button.dataset.word ?? "";
    update_guess(cur_guess.word);
  });

  let mode_btn_search_mode_on_pointerdown = search_mode;
  mode_btn.addEventListener("pointerdown", () => {
    mode_btn_search_mode_on_pointerdown = search_mode;
  });
  mode_btn.addEventListener("click", e => {
    // check if fired by keyboard or "real" click
    //
    const mode_to_toggle = e.detail === 0 ? search_mode : mode_btn_search_mode_on_pointerdown;
    set_search_mode(!mode_to_toggle);
  })
  reset_btn.addEventListener("click", reset_app);
  theme_toggle.addEventListener("click", toggle_theme);

  search_box.addEventListener("focusin", () => {
    if (!search_mode) set_search_mode(true)
  });
  search_box.addEventListener("focusout", () => {
    if (search_mode) set_search_mode(false)
  });
  let search_timer: number | undefined;
  search_box.addEventListener("input", () => {
    clearTimeout(search_timer);
    search_timer = setTimeout(() => {
      const query = search_box.value.toLowerCase();
      const matching_words = candidate_words.filter(word => word.includes(query))
      set_visible_words(matching_words)
    }, 100);
  })



  set_visible_words(candidate_words);
  boxes.forEach((box, box_idx) => {
    box.addEventListener("click", () => {
      cycle_box_correctness(box_idx)
    })
  })

  function cycle_box_correctness(box_idx: number) {
    cur_guess.correctness[box_idx] = (cur_guess.correctness[box_idx] + 1) % 3;
    boxes[box_idx].setAttribute("data-correctness", cur_guess.correctness[box_idx].toString());
  }

  document.addEventListener("keydown", e => {
    const key = e.key.toLowerCase();


    if (e.shiftKey && key == "tab") {
      e.preventDefault();
      set_search_mode(!search_mode);
    }

    if (search_mode) return

    e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && key === "r") {
      reset_app();
      return;
    }
    if (key.length === 1 && key >= "1" && key <= "5") { handle_key(key) }
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

      update_keyboard_colors(cur_guess);
      reduce_words(cur_guess);
      set_visible_words(candidate_words);

      cur_guess = {
        word: "",
        correctness: new Array(5).fill(0)
      }
      boxes.forEach((box, box_idx) => box.setAttribute("data-correctness", cur_guess.correctness[box_idx]))
      update_guess(cur_guess.word);
    } else if (key === "del") {
      if (cur_guess.word.length === 0) { return; }
      cur_guess.word = cur_guess.word.slice(0, cur_guess.word.length - 1);
      update_guess(cur_guess.word);
    } else if (key >= "1" && key <= "5") {
      cycle_box_correctness(Number(key) - 1);
    } else {
      if (cur_guess.word.length === 5) { return; }

      cur_guess.word = cur_guess.word + key;
      update_guess(cur_guess.word);
    }
  }

  function set_search_mode(val: boolean) {
    search_mode = val;
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

  function apply_theme(theme: "light" | "dark") {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
    theme_toggle.textContent = theme === "light" ? "☾" : "☀";
    theme_toggle.setAttribute(
      "aria-label",
      theme === "light" ? "Switch to dark mode" : "Switch to light mode"
    );
  }

  function toggle_theme() {
    const is_light = document.documentElement.dataset.theme === "light";
    apply_theme(is_light ? "dark" : "light");
  }

  function reset_app() {
    candidate_words = all_words;
    cur_guess = {
      word: "",
      correctness: new Array(5).fill(0)
    }
    guessed_letters.clear();
    search_box.value = "";
    set_search_mode(false);
    boxes.forEach(box => box.setAttribute("data-correctness", "0"));
    document
      .querySelectorAll<HTMLButtonElement>(".keyboard button[data-correctness]")
      .forEach(key => key.removeAttribute("data-correctness"));
    update_guess(cur_guess.word);
    set_visible_words(candidate_words);
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

  function update_keyboard_colors(g: Guess) {
    for (let i = 0; i < g.word.length; i++) {
      const letter = g.word[i];
      const correctness = g.correctness[i];
      const previous_correctness = guessed_letters.get(letter) ?? -1;

      if (correctness > previous_correctness) {
        guessed_letters.set(letter, correctness);
      }
    }

    guessed_letters.forEach((correctness, letter) => {
      const key = document.querySelector<HTMLButtonElement>(`.keyboard button[data-key="${letter}"]`);
      key?.setAttribute("data-correctness", correctness.toString());
    })
  }

  function reduce_words(g: Guess) {
    const constraints = get_guess_constraints(g);
    candidate_words = candidate_words.filter(word => word_matches_constraints(word, constraints));
  }

  function get_guess_constraints(g: Guess): Guess_Constraints {
    const greens: Array<string | undefined> = new Array(g.word.length).fill(undefined);
    const yellows = new Map<number, string>();
    const min_counts = new Map<string, number>();
    const max_counts = new Map<string, number>();
    const present_counts = new Map<string, number>();
    const guessed_counts = count_letters(g.word);

    for (let i = 0; i < g.word.length; i++) {
      const letter = g.word[i];
      const correctness = g.correctness[i];

      if (correctness === 2) {
        greens[i] = letter;
        present_counts.set(letter, (present_counts.get(letter) ?? 0) + 1);
      } else if (correctness === 1) {
        yellows.set(i, letter);
        present_counts.set(letter, (present_counts.get(letter) ?? 0) + 1);
      }
    }

    present_counts.forEach((count, letter) => {
      min_counts.set(letter, count);
    });

    guessed_counts.forEach((guess_count, letter) => {
      const present_count = present_counts.get(letter) ?? 0;
      if (present_count < guess_count) {
        max_counts.set(letter, present_count);
      }
    });

    return { greens, yellows, min_counts, max_counts };
  }

  function word_matches_constraints(word: string, constraints: Guess_Constraints): boolean {
    const word_counts = count_letters(word);

    for (let i = 0; i < constraints.greens.length; i++) {
      const green = constraints.greens[i];
      if (green !== undefined && word[i] !== green) { return false; }
    }

    for (const [idx, letter] of constraints.yellows) {
      if (word[idx] === letter) { return false; }
    }

    for (const [letter, min_count] of constraints.min_counts) {
      if ((word_counts.get(letter) ?? 0) < min_count) { return false; }
    }

    for (const [letter, max_count] of constraints.max_counts) {
      if ((word_counts.get(letter) ?? 0) > max_count) { return false; }
    }

    return true;
  }

  function count_letters(word: string): Map<string, number> {
    const counts = new Map<string, number>();

    for (const letter of word) {
      counts.set(letter, (counts.get(letter) ?? 0) + 1);
    }

    return counts;
  }

  function set_visible_words(new_words: string[]) {
    visible_words = new_words;
    word_ct.innerText = visible_words.length.toString();
    results_spacer.style.height = `${visible_words.length * ROW_HEIGHT}px`;
    results_div.scrollTop = 0;
    render_virtual_words();
  }

  function schedule_virtual_render() {
    if (render_scheduled) return;

    render_scheduled = true;
    requestAnimationFrame(() => {
      render_scheduled = false;
      render_virtual_words();
    })
  }

  function render_virtual_words() {
    const container_height = results_div.clientHeight;
    const scroll_top = results_div.scrollTop;
    const start_index = Math.max(0, Math.floor(scroll_top / ROW_HEIGHT) - BUFFER_ROWS);
    const end_index = Math.min(
      visible_words.length,
      Math.ceil((scroll_top + container_height) / ROW_HEIGHT) + BUFFER_ROWS
    );

    results_window.style.transform = `translateY(${start_index * ROW_HEIGHT}px)`;
    results_window.replaceChildren();

    for (let i = start_index; i < end_index; i++) {
      const wrap_div = document.createElement('div');
      wrap_div.className = "result";
      wrap_div.innerHTML = `<p>${visible_words[i]}</p><button type="button" data-word="${visible_words[i]}">Add</button>`;
      results_window.appendChild(wrap_div);
    }
  }
})();
