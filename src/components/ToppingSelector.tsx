import Image from "next/image";
import { ToppingType } from "@/data/toppings";

interface ToppingSelectorProps {
  toppings: ToppingType[];
  pizzaToppings: any[];
  activeToppingForPlacement: any;
  handleToppingClick: (topping: ToppingType) => void;
  handlePlacementSelect: (placement: string) => void;
  getToppingTranslation: (name: string) => string;
  formatPrice: (price: number) => string;
  translations: any;
  language: string;
}

export function ToppingSelector({
  toppings,
  pizzaToppings,
  activeToppingForPlacement,
  handleToppingClick,
  handlePlacementSelect,
  getToppingTranslation,
  formatPrice,
  translations,
  language
}: ToppingSelectorProps) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-2 xl:grid-cols-3 gap-[2px] xs:gap-1 sm:gap-4">
      {toppings.map((topping) => (
        <div
          key={topping.name}
          className="relative"
        >
          {activeToppingForPlacement?.name === topping.name && (
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white shadow-xl p-2 z-50 topping-placement-popup border-2 border-gray-200">
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlacementSelect('full');
                  }}
                  className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-black transition-colors overflow-hidden"
                  title="Full"
                >
                  <div className="w-full h-full rounded-full bg-black hover:bg-black" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlacementSelect('left');
                  }}
                  className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-black transition-colors overflow-hidden"
                  title="Left Half"
                >
                  <div className="w-full h-full rounded-full bg-white">
                    <div className="w-1/2 h-full bg-black hover:bg-black" />
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlacementSelect('right');
                  }}
                  className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-black transition-colors overflow-hidden"
                  title="Right Half"
                >
                  <div className="w-full h-full rounded-full bg-white">
                    <div className="w-1/2 h-full bg-black hover:bg-black ml-auto" />
                  </div>
                </button>
              </div>
            </div>
          )}
          
          <div 
            className={`relative p-[2px] xs:p-1 sm:p-3 flex flex-col items-center transform transition-transform hover:scale-105 ${
              pizzaToppings.some(t => t.name === topping.name) ? 
              'ring-1 xs:ring-2 ring-black ring-offset-1 xs:ring-offset-2 rounded-full bg-gradient-to-br from-rose-100/80 to-teal-100/80 backdrop-blur-sm cursor-pointer' : ''
            }`}
            onClick={() => pizzaToppings.some(t => t.name === topping.name) ? handleToppingClick(topping) : undefined}
          >
            {pizzaToppings.some(t => t.name === topping.name) && (
              <div className="absolute top-0 right-0 w-6 h-6 bg-black rounded-full flex items-center justify-center transform translate-x-1/3 -translate-y-1/3 shadow-md">
                {pizzaToppings.find(t => t.name === topping.name)?.placement === 'full' ? (
                  <div className="w-4 h-4 rounded-full bg-black" />
                ) : pizzaToppings.find(t => t.name === topping.name)?.placement === 'left' ? (
                  <div className="w-4 h-4 rounded-full overflow-hidden bg-white">
                    <div className="w-1/2 h-full bg-black" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full overflow-hidden bg-white">
                    <div className="w-1/2 h-full bg-black float-right" />
                  </div>
                )}
              </div>
            )}
            
            <div
              className={`relative w-[80%] aspect-square rounded-full min-w-[25px] xs:min-w-[30px] sm:min-w-[45px] max-w-[35px] xs:max-w-[40px] sm:max-w-[65px] lg:max-w-[75px] mx-auto ${
                pizzaToppings.some(t => t.name === topping.name) ? 'scale-95' : ''
              }`}
              style={{
                background: "linear-gradient(145deg, #d4d4d4, #e8e8e8)",
                boxShadow: `
                  inset 0 4px 8px rgba(0,0,0,0.25),
                  inset 0 -2px 4px rgba(255,255,255,0.5),
                  0 2px 4px rgba(0,0,0,0.15)
                `,
                transform: "perspective(500px) rotateX(12deg)",
              }}
            >
              <div
                className="absolute inset-[2px] rounded-full pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              />

              <div
                className="absolute inset-0 flex items-center justify-center"
                onClick={(e) => {
                  if (!pizzaToppings.some(t => t.name === topping.name)) {
                    e.stopPropagation();
                    handleToppingClick(topping);
                  }
                }}
              >
                <div className={`w-[85%] h-[85%] relative ${
                  topping.name === "Tomatoes" ? "scale-125" : ""
                }`}>
                  <Image
                    src={topping.image}
                    alt={topping.name}
                    width={100}
                    height={100}
                    className="w-full h-full object-contain select-none"
                    style={{
                      backgroundColor: "transparent",
                      mixBlendMode: "multiply",
                      filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.2)) contrast(1.1) saturate(1.2)",
                      imageRendering: "crisp-edges",
                    }}
                    quality={100}
                    unoptimized={topping.name === "Mushrooms"}
                  />
                </div>
              </div>

              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background:
                    "linear-gradient(45deg, rgba(255,255,255,0.2) 0%, transparent 70%)",
                  border: "1px solid rgba(255,255,255,0.3)",
                }}
              />
            </div>

            <div className="mt-[1px] xs:mt-0.5 sm:mt-2 text-center">
              <p className="text-[7px] xs:text-[8px] sm:text-xs font-medium text-gray-700">
                {getToppingTranslation(topping.name)}
              </p>
              <p className="text-[6px] xs:text-[7px] sm:text-xs text-gray-500">
                {formatPrice(topping.price)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
