"use client";
import { useEffect } from "react";
import cx from "classnames";
import Guess from "~/app/(game)/Guess";
import WordBank from "~/app/(game)/WordBank";
import useWordle from "~/app/(game)/useWordle";
import { Button } from "~/components/ui/button";

export default function Game() {
  const {
    handleKeys,
    curGuess,
    curColors,
    setCurColors,
    wordBoard,
    colorBoard,
    resetGame,
    fetchWords,
    filterWords,
    wordBank,
    setWordBank,
  } = useWordle();

  useEffect(() => {
    window.addEventListener("keyup", handleKeys);
    return () => window.removeEventListener("keyup", handleKeys);
  }, [handleKeys]);

  useEffect(() => {
    fetchWords()
      .then((data) => setWordBank(data))
      .catch((err) => console.log("There Was An Error: ", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setWordBank(filterWords(wordBank));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordBoard]);

  return (
    <div className="px-edge">
      <h2 className="text-center">Your Current Guess</h2>
      <div className="mt-3 flex justify-center">
        <Guess letters={curGuess} colors={curColors} setColors={setCurColors} />
      </div>
      <div className="mt-5 flex flex-col items-center justify-center">
        <p className="text-lg">Your Guesses:</p>
        <div>
          {colorBoard?.map((colors, i) => (
            <div key={`guess-${i}`} className="">
              {wordBoard[i]?.split("").map((letter, j) => (
                <p
                  key={`letter-${i}-${j}`}
                  className={cx(
                    "inline text-lg font-bold",
                    colors[j] === "grey" && "text-gray-500",
                    colors[j] === "yellow" && "text-yellow-500",
                    colors[j] === "green" && "text-green-500",
                  )}
                >
                  {letter}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex justify-center">
        <Button variant="destructive" size="lg" onClick={() => resetGame()}>
          Reset
        </Button>
      </div>
      <div className="mt-3 flex justify-center">
        <WordBank wordBank={wordBank} />
      </div>{" "}
    </div>
  );
}
