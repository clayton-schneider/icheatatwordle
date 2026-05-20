interface Guess {
  value: string,
  correctness: number[]
}

interface State {
  search_mode: boolean
  all_words: string[]
  cur_guess: Guess
  guesses: Guess[]
}

function init_state(): State {
  return {
    search_mode: false,
    all_words: ['apple'],
    cur_guess: {
      value: "",
      correctness: new Array(5).fill(0)
    },
    guesses: []
  }
}

function set_search_mode(s: State, new_bool: boolean) { s.search_mode = new_bool; }

function reset_cur_guess(s: State) {
  s.cur_guess.correctness = new Array(5).fill(0);
  s.cur_guess.value = "";
}

function add_letter_to_guess(s: State, letter: string) {
  if (letter.length > 1) { letter = letter[0]; }
  if (s.cur_guess.value.length < 5) {
    s.cur_guess.value += letter;
  }
}

function delete_letter_from_guess(s: State) {
  s.cur_guess.value = s.cur_guess.value.slice(0, s.cur_guess.value.length - 1);
}

function commit_cur_guess(s: State) {
  const cur_guess = s.cur_guess;
  s.guesses.push(s.cur_guess);
  reset_cur_guess(s);
  s.all_words = s.all_words.filter(word => {
    for (let i = 0; i < cur_guess.value.length; i++) {
      // remove words with grey letter
      if (cur_guess.correctness[i] === 0 && word.includes(cur_guess.value[i])) { return false; }

      if (cur_guess.correctness[i] === 1) {
        // make sure word doesn't have a yellow letter in same idx
        if (word[i] === cur_guess.value[i]) { return false; }
        // make sure word includes yellow letter
        if (!word.includes(cur_guess.value[i])) { return false; }
      }

      // make sure word has green letter in proper place
      if (cur_guess.correctness[i] === 2 && word[i] !== cur_guess.value[i]) { return false; }
    }
    // word has passed all filter checks
    return true;
  })
}

/*
  * @param s: The current state
  * @param idx: The index of the current guess character whose correctness should cycle
*/
function cycle_correctness(s: State, idx: number) {
  s.cur_guess.correctness[idx] = (s.cur_guess.correctness[idx] + 1) % 3
}

function search_words(s: State, query: string): string[] {
  return s.all_words.filter(word => word.includes(query));
}
