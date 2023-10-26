import type { wordBank } from "~/app/(game)/useWordle";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";

interface IWordBankProps {
  wordBank: wordBank;
}
const WordBank = ({ wordBank }: IWordBankProps) => {
  return (
    <div>
      <ScrollArea className="h-72 w-48 rounded-md border">
        <div className="p-4">
          <h4 className="mb-4 text-sm font-medium leading-none">
            Possible Words
          </h4>
          {wordBank?.map((word) => (
            <div key={word}>
              <div className="text-sm">{word}</div>
              <Separator className="my-2" />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default WordBank;
