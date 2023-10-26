import React from "react";

export default function Keypad() {
  const letters = [
    [
      { key: "q" },
      { key: "w" },
      { key: "e" },
      { key: "r" },
      { key: "t" },
      { key: "y" },
      { key: "u" },
      { key: "i" },
      { key: "o" },
      { key: "p" },
    ],
    [
      { key: "spacer" },
      { key: "a" },
      { key: "s" },
      { key: "d" },
      { key: "f" },
      { key: "g" },
      { key: "h" },
      { key: "j" },
      { key: "k" },
      { key: "l" },
      { key: "spacer" },
    ],
    [
      { key: "Enter" },
      { key: "z" },
      { key: "x" },
      { key: "c" },
      { key: "v" },
      { key: "b" },
      { key: "n" },
      { key: "m" },
      { key: "Backspace" },
    ],
  ];

  const dispatchKeyPress = (key: string) => {
    window.dispatchEvent(new KeyboardEvent("keyup", { key }));
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-3 py-5">
      {letters.map((row, i) => (
        <div key={`row-${i}`} className="flex w-full gap-3">
          {row.map((letter, j) => (
            <React.Fragment key={`key-${i}-${j}`}>
              {/* Spacer  */}
              {letter.key === "spacer" && (
                <div key={`spacer-${j}`} className="flex-[0.5]"></div>
              )}

              {/* Regular Keys */}
              {!["spacer", "Enter", "Backspace"].includes(letter.key) && (
                <div
                  className="flex h-[50px] flex-1 cursor-pointer select-none items-center justify-center rounded-md bg-slate-300 text-center font-bold"
                  key={letter.key}
                  onClick={() => dispatchKeyPress(letter.key)}
                >
                  {letter.key}
                </div>
              )}

              {/* Backspace */}
              {letter.key === "Backspace" && (
                <div
                  key="backspace"
                  className="flex h-[50px] flex-[1.5] cursor-pointer select-none items-center justify-center rounded-md bg-slate-300 text-center font-bold"
                  onClick={() => dispatchKeyPress("Backspace")}
                >
                  delete
                </div>
              )}

              {/* Enter */}
              {letter.key === "Enter" && (
                <div
                  key="enter"
                  className="flex h-[50px] flex-[1.5] cursor-pointer select-none items-center justify-center rounded-md bg-slate-300 text-center font-bold"
                  onClick={() => dispatchKeyPress("Enter")}
                >
                  enter
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      ))}
    </div>
  );
}
