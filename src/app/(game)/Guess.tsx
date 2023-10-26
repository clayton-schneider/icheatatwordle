import cx from "classnames";
import type { curColors, curGuess, setCurColors } from "~/app/(game)/useWordle";

interface IGuessProps {
  letters: curGuess;
  colors: curColors;
  setColors: setCurColors;
}

const Guess = ({ letters, colors, setColors }: IGuessProps) => {
  const changeColor = (i: number) => {
    const newColors = [...colors];

    if (colors[i] === "grey") {
      newColors[i] = "yellow";
    } else if (colors[i] === "yellow") {
      newColors[i] = "green";
    } else if (colors[i] === "green") {
      newColors[i] = "grey";
    }
    setColors(newColors);
  };

  return (
    <div className="flex space-x-2">
      {colors.map((c, i) => {
        return (
          <div
            onClick={() => changeColor(i)}
            key={`letter-${i}`}
            className={cx(
              "flex h-14 w-14 cursor-pointer items-center justify-center border-b-2 md:h-20 md:w-20",
              c === "grey" && " bg-gray-200",
              c === "yellow" && "bg-yellow-500",
              c === "green" && "bg-green-500",
            )}
          >
            {letters[i] && <p className="text-2xl font-bold">{letters[i]}</p>}
          </div>
        );
      })}
    </div>
  );
};

export default Guess;
