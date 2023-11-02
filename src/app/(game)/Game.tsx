"use client";
import { useEffect } from "react";
import cx from "classnames";
import Guess from "~/app/(game)/Guess";
import WordBank from "~/app/(game)/WordBank";
import useWordle from "~/app/(game)/useWordle";
import { Button } from "~/components/ui/button";
import Keypad from "./Keypad";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Info } from "lucide-react";

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
      <div className="flex justify-center space-x-2">
        <h2 className="text-center">Your Current Guess</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info />
            </TooltipTrigger>
            <TooltipContent>
              <p>Click the boxes to cycle through correctness</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="mt-3 flex justify-center">
        <Guess letters={curGuess} colors={curColors} setColors={setCurColors} />
      </div>
      <div className="mt-5 flex flex-col items-center justify-center">
        <div className="flex justify-center space-x-2">
          <p className="text-lg">Your Guesses:</p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info />
              </TooltipTrigger>
              <TooltipContent>
                <p>Your entered guesses will show here</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
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
      <Keypad />
    </div>
  );
}
