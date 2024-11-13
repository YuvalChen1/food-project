"use client";

import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UtensilsCrossed, X } from "lucide-react";

const toppings = [
  { name: "Pepperoni", image: "/toppings/pepperoni.png", price: 1.5 },
  { name: "Mushrooms", image: "/toppings/mushrooms.png", price: 1 },
  { name: "Onions", image: "/toppings/onions.png", price: 0.75 },
  { name: "Sausage", image: "/toppings/sausage.png", price: 1.5 },
  { name: "Bacon", image: "/toppings/bacon.png", price: 1.5 },
  { name: "Extra cheese", image: "/toppings/cheese.png", price: 1 },
  { name: "Black olives", image: "/toppings/olives.png", price: 1 },
  { name: "Green peppers", image: "/toppings/green-peppers.png", price: 0.75 },
];

const sizePrices: any = {
  s: 8,
  m: 10,
  l: 12,
};

export default function PizzaBuilder() {
  const [pizzaSize, setPizzaSize] = useState("m");
  const [pizzaToppings, setPizzaToppings] = useState<any>([]);
  const [selectedTopping, setSelectedTopping] = useState<any>(null);
  const [toppingPlacement, setToppingPlacement] = useState("full");
  const pizzaRef = useRef<any>(null);

  const handleDragStart = (e: any, topping: any) => {
    e.dataTransfer.setData("topping", JSON.stringify(topping));
    setSelectedTopping(topping);
  };

  const handleTouchStart = (e: any, topping: any) => {
    setSelectedTopping(topping);
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
  };

  const handleTouchMove = (e: any) => {
    e.preventDefault();
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    addToppingToPizza(e.clientX, e.clientY);
  };

  const handleTouchEnd = (e: any) => {
    const touch = e.changedTouches[0];
    addToppingToPizza(touch.clientX, touch.clientY);
  };

  const addToppingToPizza = (clientX: any, clientY: any) => {
    if (!selectedTopping) return;

    const pizzaRect = pizzaRef.current.getBoundingClientRect();
    const x = (clientX - pizzaRect.left) / pizzaRect.width;
    const y = (clientY - pizzaRect.top) / pizzaRect.height;

    // Check if the topping already exists
    const existingToppingIndex = pizzaToppings.findIndex(
      (t: any) => t.name === selectedTopping.name
    );

    if (existingToppingIndex !== -1) {
      // Update existing topping
      const updatedToppings: any = [...pizzaToppings];
      updatedToppings[existingToppingIndex] = {
        ...selectedTopping,
        id: Date.now(),
        x,
        y,
        placement: toppingPlacement,
        positions: generateToppingPositions(toppingPlacement),
      };
      setPizzaToppings(updatedToppings);
    } else {
      // Add new topping
      const newTopping = {
        ...selectedTopping,
        id: Date.now(),
        x,
        y,
        placement: toppingPlacement,
        positions: generateToppingPositions(toppingPlacement),
      };
      setPizzaToppings([...pizzaToppings, newTopping]);
    }

    setSelectedTopping(null);
  };

  const generateToppingPositions = useCallback((placement: any) => {
    const positions = [];
    const toppingCount = 10;

    for (let i = 0; i < toppingCount; i++) {
      let x, y;
      if (placement === "full") {
        x = Math.random();
        y = Math.random();
      } else if (placement === "left") {
        x = Math.random() * 0.5;
        y = Math.random();
      } else {
        // right
        x = Math.random() * 0.5 + 0.5;
        y = Math.random();
      }
      positions.push({ x, y });
    }

    return positions;
  }, []);

  const handleClear = () => {
    setPizzaToppings([]);
  };

  const calculateTotal = () => {
    const basePrice = sizePrices[pizzaSize];
    const toppingsPrice = pizzaToppings.reduce(
      (total: any, topping: any) => total + topping.price,
      0
    );
    return (basePrice + toppingsPrice).toFixed(2);
  };

  const handleCompleteOrder = () => {
    const total = calculateTotal();
    alert(`Order Summary:
    Size: ${pizzaSize.toUpperCase()}
    Toppings: ${pizzaToppings
      .map((t: any) => `${t.name} (${t.placement})`)
      .join(", ")}
    Total: $${total}
    
    Thank you for your order!`);
  };

  const renderTopping = (topping: any) => {
    return topping.positions.map((position: any, i: any) => (
      <img
        key={`${topping.id}-${i}`}
        src={topping.image}
        alt={topping.name}
        className="absolute w-6 h-6 object-contain pointer-events-none"
        style={{
          left: `${position.x * 100}%`,
          top: `${position.y * 100}%`,
          transform: "translate(-50%, -50%)",
          mixBlendMode: "multiply",
        }}
      />
    ));
  };

  const removeTopping = (toppingId: any) => {
    setPizzaToppings(pizzaToppings.filter((t: any) => t.id !== toppingId));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-black text-white px-4 lg:px-6 py-4 sm:py-6">
        <div className="container mx-auto flex items-center justify-between">
          <a className="flex items-center justify-center" href="#">
            <UtensilsCrossed className="h-6 w-6 sm:h-8 sm:w-8" />
            <span className="ml-2 text-lg sm:text-xl md:text-2xl font-bold">
              Pizza Paradise
            </span>
          </a>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Build Your Perfect Pizza
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 order-2 lg:order-1">
            <div className="w-full max-w-md mx-auto aspect-square relative">
              <div
                ref={pizzaRef}
                className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-200 border-8 border-yellow-700 transition-all duration-300 overflow-hidden ${
                  pizzaSize === "s"
                    ? "w-3/4 h-3/4"
                    : pizzaSize === "m"
                    ? "w-5/6 h-5/6"
                    : "w-full h-full"
                }`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {pizzaToppings.map((topping: any) => renderTopping(topping))}
              </div>
            </div>

            <div className="flex justify-center mt-4 space-x-4">
              <Button
                onClick={() => setPizzaSize("s")}
                variant={pizzaSize === "s" ? "default" : "outline"}
              >
                S
              </Button>
              <Button
                onClick={() => setPizzaSize("m")}
                variant={pizzaSize === "m" ? "default" : "outline"}
              >
                M
              </Button>
              <Button
                onClick={() => setPizzaSize("l")}
                variant={pizzaSize === "l" ? "default" : "outline"}
              >
                L
              </Button>
            </div>

            <div className="flex justify-center mt-4 space-x-4">
              <Button
                onClick={() => setToppingPlacement("full")}
                variant={toppingPlacement === "full" ? "default" : "outline"}
              >
                Full
              </Button>
              <Button
                onClick={() => setToppingPlacement("left")}
                variant={toppingPlacement === "left" ? "default" : "outline"}
              >
                Left Half
              </Button>
              <Button
                onClick={() => setToppingPlacement("right")}
                variant={toppingPlacement === "right" ? "default" : "outline"}
              >
                Right Half
              </Button>
            </div>

            <div className="mt-4 space-y-4">
              <ScrollArea className="h-32 border rounded-md p-2">
                {pizzaToppings.map((topping: any) => (
                  <div
                    key={topping.id}
                    className="flex justify-between items-center mb-2"
                  >
                    <span>
                      {topping.name} ({topping.placement})
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTopping(topping.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </ScrollArea>

              <div className="flex justify-between">
                <Button onClick={handleClear} variant="destructive">
                  Clear Toppings
                </Button>
                <Button onClick={handleCompleteOrder} variant="default">
                  Complete Order (${calculateTotal()})
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 order-1 lg:order-2">
            <h2 className="text-2xl font-bold mb-4 text-center">Toppings</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {toppings.map((topping) => (
                <div
                  key={topping.name}
                  className="bg-white p-2 rounded shadow cursor-move"
                  draggable
                  onDragStart={(e) => handleDragStart(e, topping)}
                  onTouchStart={(e) => handleTouchStart(e, topping)}
                >
                  <div className="w-16 h-16 mx-auto mb-2 relative">
                    <img
                      src={topping.image}
                      alt={topping.name}
                      className="w-full h-full object-contain"
                      style={{ mixBlendMode: "multiply" }}
                    />
                  </div>
                  <p className="text-center text-sm">{topping.name}</p>
                  <p className="text-center text-sm text-gray-500">
                    ${topping.price.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
