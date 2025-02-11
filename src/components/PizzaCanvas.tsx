import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { ToppingType } from "@/data/toppings";

interface PizzaCanvasProps {
  pizzaRef: React.RefObject<HTMLDivElement>;
  pizzaSize: string;
  pizzaToppings: any[];
  hasExtraCheese: boolean;
  cheesePlacement: string;
  handleClear: () => void;
  renderTopping: (topping: any) => React.JSX.Element[] | React.JSX.Element | null | undefined;
  translations: any;
  language: string;
}

export function PizzaCanvas({
  pizzaRef,
  pizzaSize,
  pizzaToppings,
  hasExtraCheese,
  cheesePlacement,
  handleClear,
  renderTopping,
  translations,
  language
}: PizzaCanvasProps) {
  return (
    <div className="flex-1 flex flex-col items-center">
      <div className="relative w-full max-w-[240px] xs:max-w-[280px] sm:max-w-[350px] md:max-w-md">
        {pizzaToppings.length > 0 && (
          <Button
            onClick={handleClear}
            variant="ghost"
            size="icon"
            className="absolute right-[-20px] xs:right-[-30px] top-[25%] -translate-y-1/2 hover:bg-red-100 hover:text-red-600 transition-colors w-12 h-12 xs:w-16 xs:h-16 sm:w-20 sm:h-20 z-10 !p-0"
            title={translations[language].clearToppings}
            style={{
              minWidth: "unset",
              minHeight: "unset",
            }}
          >
            <Trash2
              strokeWidth={2}
              className="w-full h-full"
              style={{
                width: "100%",
                height: "100%",
                padding: "1rem",
              }}
            />
          </Button>
        )}

        <div className="aspect-square relative">
          <div
            ref={pizzaRef}
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 overflow-hidden ${
              pizzaSize === "s"
                ? "w-[60%] h-[60%] sm:w-3/4 sm:h-3/4"
                : pizzaSize === "m"
                ? "w-[70%] h-[70%] sm:w-5/6 sm:h-5/6"
                : "w-[80%] h-[80%] sm:w-[90%] sm:h-[90%]"
            }`}
          >
            <div className="relative w-full h-full">
              <Image
                src="/pizza-base.png"
                alt="Pizza base"
                fill
                className="object-cover"
                priority
              />
              {hasExtraCheese && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    clipPath:
                      cheesePlacement === "left"
                        ? "polygon(0 0, 50% 0, 50% 100%, 0 100%)"
                        : cheesePlacement === "right"
                        ? "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)"
                        : "none",
                    transform: "scale(1.03)",
                    transformOrigin: "center center",
                  }}
                >
                  <Image
                    src="/pizza-cheese.png"
                    alt="Extra cheese"
                    fill
                    className="object-cover"
                    style={{
                      transformOrigin: "center center",
                    }}
                    priority
                  />
                </div>
              )}
            </div>
            {pizzaToppings.map((topping) => renderTopping(topping))}
          </div>
        </div>
      </div>
    </div>
  );
}
