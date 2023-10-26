import { useState } from "react";

type WordBank = Record<string, string>;

const useWordle = () => {
  // track current user input
  const [curGuess, setCurGuess] = useState("");
  const startingColors = ["grey", "grey", "grey", "grey", "grey"];
  const [curColors, setCurColors] = useState(startingColors);

  // track history of use input
  const [wordBoard, setWordBoard] = useState<string[]>([]);
  const [colorBoard, setColorBoard] = useState<string[][]>([]);

  // potential words
  const [wordBank, setWordBank] = useState<string[]>([]);

  const fetchWords = async () => {
    const res = await fetch("/wordle-dictionary.json");
    const data = (await res.json()) as WordBank;

    return Object.keys(data);
  };

  const resetGame = () => {
    setCurGuess("");
    setCurColors(["grey", "grey", "grey", "grey", "grey"]);
    setWordBoard([]);
    setColorBoard([]);
    fetchWords()
      .then((data) => setWordBank(data))
      .catch((err) => console.log("There was an error fetching words: ", err));
  };

  // game keyboard controller
  const handleKeys = (e: KeyboardEvent) => {
    // check if non letter key

    if (e.key === "Backspace") {
      setCurGuess(curGuess.slice(0, -1));
    }

    // handle enter
    if (curGuess.length === 5 && e.key === "Enter") {
      // todo - handle no click - all grey
      setCurGuess("");
      setCurColors(startingColors);
      handleGameHistory();
    }

    // prevent non letters
    if (/^[A-Za-z]$/.test(e.key)) {
      if (curGuess.length < 5) {
        setCurGuess(curGuess + e.key);
      }
    }
  };

  const handleGameHistory = () => {
    let newWords = [];
    let newColors = [];

    // check if null
    if (wordBoard === null && colorBoard === null) {
      newWords.push(curGuess);
      newColors.push(curColors);
    } else {
      newWords = [...wordBoard];
      newColors = [...colorBoard];

      newWords.push(curGuess);
      newColors.push(curColors);
    }
    setWordBoard(newWords);
    setColorBoard(newColors);
  };

  const filterWords = (wordBank: string[]) => {
    // already have the words don't need to fetch

    console.log("filtering!");

    const newWordBank = wordBank.filter((bankWord) => {
      let passes = true;

      wordBoard.map((guessWord, wordIndex) => {
        // if fails then exit
        if (!passes) {
          return;
        }

        guessWord.split("").map((_, letterIndex) => {
          if (!passes) {
            return;
          }

          // Keep fail conditions at the top to minimize looping

          // If grey and contains
          if (
            colorBoard[wordIndex]![letterIndex] === "grey" &&
            bankWord.includes(guessWord[letterIndex]!)
          ) {
            passes = false;
            return;
          }

          // if green and doesn't contain letter at proper index
          if (
            colorBoard[wordIndex]![letterIndex] === "green" &&
            bankWord[letterIndex] !== guessWord[letterIndex]
          ) {
            passes = false;
            return;
          }

          // if yellow and doesn't contain
          if (
            colorBoard[wordIndex]![letterIndex] === "yellow" &&
            !bankWord.includes(guessWord[letterIndex]!)
          ) {
            passes = false;
            return;
          }

          // if yellow and contain but same index
          if (
            colorBoard[wordIndex]![letterIndex] === "yellow" &&
            bankWord[letterIndex] === guessWord[letterIndex]
          ) {
            passes = false;
            return;
          }
        });
      });

      return passes;
    });
    console.log(wordBank.length, newWordBank.length);
    return newWordBank;
  };

  return {
    handleKeys,
    curGuess,
    handleGameHistory,
    wordBoard,
    setWordBoard,
    colorBoard,
    setColorBoard,
    resetGame,
    curColors,
    setCurColors,
    fetchWords,
    filterWords,
    wordBank,
    setWordBank,
  };
};

export default useWordle;
export type curGuess = ReturnType<typeof useWordle>["curGuess"];
export type curColors = ReturnType<typeof useWordle>["curColors"];
export type wordBank = ReturnType<typeof useWordle>["wordBank"];
export type setCurColors = ReturnType<typeof useWordle>["setCurColors"];
export type setWordBank = ReturnType<typeof useWordle>["setWordBank"];
export type FetchWords = ReturnType<typeof useWordle>["fetchWords"];
export type FilterWords = ReturnType<typeof useWordle>["filterWords"];
