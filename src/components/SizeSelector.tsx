import { Button } from "@/components/ui/button";
import { Language } from "@/lib/translations";

interface SizeSelectorProps {
  pizzaSize: string;
  setPizzaSize: (size: string) => void;
  translations: any;
  language: Language;
}

export function SizeSelector({
  pizzaSize,
  setPizzaSize,
  translations,
  language
}: SizeSelectorProps) {
  return (
    <div className="flex justify-center mt-1 xs:mt-2 sm:mt-4 space-x-1 xs:space-x-2 sm:space-x-4">
      <Button
        onClick={() => setPizzaSize("s")}
        variant={pizzaSize === "s" ? "default" : "outline"}
      >
        {translations[language].sizes.small}
      </Button>
      <Button
        onClick={() => setPizzaSize("m")}
        variant={pizzaSize === "m" ? "default" : "outline"}
      >
        {translations[language].sizes.medium}
      </Button>
      <Button
        onClick={() => setPizzaSize("l")}
        variant={pizzaSize === "l" ? "default" : "outline"}
      >
        {translations[language].sizes.large}
      </Button>
    </div>
  );
}
