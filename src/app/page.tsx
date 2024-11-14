'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UtensilsCrossed, X } from 'lucide-react'
import { toppings, ToppingType } from '@/data/toppings'

interface Topping extends ToppingType {
  x?: number;
  y?: number;
  placement?: string;
  positions?: ToppingPosition[];
}

interface ToppingPosition {
  x: number;
  y: number;
}

const sizePrices: Record<string, number> = {
  s: 8,
  m: 10,
  l: 12,
}

export default function PizzaBuilder() {
  const [pizzaSize, setPizzaSize] = useState<string>("m")
  const [pizzaToppings, setPizzaToppings] = useState<Topping[]>([])
  const [selectedTopping, setSelectedTopping] = useState<Topping | null>(null)
  const [toppingPlacement, setToppingPlacement] = useState<string>("full")
  const [isDragging, setIsDragging] = useState(false)
  const pizzaRef = useRef<HTMLDivElement>(null)
  const draggedToppingRef = useRef<HTMLDivElement>(null)
  const [hasExtraCheese, setHasExtraCheese] = useState(false)
  const [cheesePlacement, setCheesePlacement] = useState<string>('full');

  useEffect(() => {
    const preventDefault = (e: Event) => e.preventDefault()
    document.addEventListener('gesturestart', preventDefault, { passive: false })
    document.addEventListener('gesturechange', preventDefault, { passive: false })
    document.addEventListener('gestureend', preventDefault, { passive: false })
    return () => {
      document.removeEventListener('gesturestart', preventDefault)
      document.removeEventListener('gesturechange', preventDefault)
      document.removeEventListener('gestureend', preventDefault)
    }
  }, [])

  const handleDragStart = (e: React.DragEvent, topping: Topping) => {
    e.dataTransfer.setData("topping", JSON.stringify(topping))
    setSelectedTopping(topping)
  }

  const handleTouchStart = (e: React.TouchEvent, topping: Topping) => {
    setSelectedTopping(topping)
    setIsDragging(true)
    const touch = e.touches[0]
    if (draggedToppingRef.current) {
      draggedToppingRef.current.style.left = `${touch.clientX - 32}px`
      draggedToppingRef.current.style.top = `${touch.clientY - 32}px`
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !draggedToppingRef.current) return
    const touch = e.touches[0]
    draggedToppingRef.current.style.left = `${touch.clientX - 32}px`
    draggedToppingRef.current.style.top = `${touch.clientY - 32}px`
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging || !selectedTopping) return
    const touch = e.changedTouches[0]
    addToppingToPizza(touch.clientX, touch.clientY)
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    addToppingToPizza(e.clientX, e.clientY)
  }

  const addToppingToPizza = (clientX: number, clientY: number) => {
    if (!selectedTopping || !pizzaRef.current) return;
    
    if (selectedTopping.name === 'Extra cheese') {
      setHasExtraCheese(true);
      setCheesePlacement(toppingPlacement);
      const newTopping: Topping = {
        ...selectedTopping,
        placement: toppingPlacement,
      };
      setPizzaToppings([...pizzaToppings, newTopping]);
      setSelectedTopping(null);
      return;
    }
    
    const pizzaRect = pizzaRef.current.getBoundingClientRect();
    const x = (clientX - pizzaRect.left) / pizzaRect.width;
    const y = (clientY - pizzaRect.top) / pizzaRect.height;

    const relX = x - 0.5;
    const relY = y - 0.5;
    if (Math.sqrt(relX * relX + relY * relY) > 0.5) {
      setSelectedTopping(null);
      return;
    }

    const existingToppingIndex = pizzaToppings.findIndex(t => t.name === selectedTopping.name);

    if (existingToppingIndex !== -1) {
      const updatedToppings = [...pizzaToppings];
      updatedToppings[existingToppingIndex] = {
        ...selectedTopping,
        x,
        y,
        placement: toppingPlacement,
        positions: generateToppingPositions(toppingPlacement, selectedTopping.renderType),
      };
      setPizzaToppings(updatedToppings);
    } else {
      const newTopping: Topping = {
        ...selectedTopping,
        x,
        y,
        placement: toppingPlacement,
        positions: generateToppingPositions(toppingPlacement, selectedTopping.renderType),
      };
      setPizzaToppings([...pizzaToppings, newTopping]);
    }

    setSelectedTopping(null);
  };

  const generateToppingPositions = useCallback((placement: string, renderType: 'scattered' | 'layer'): ToppingPosition[] => {
    if (renderType === 'layer') return [];
    
    const positions = [];
    const toppingCount = 8;
    const radius = 0.35;

    const isInsideCircle = (x: number, y: number) => {
      const relX = x - 0.5;
      const relY = y - 0.5;
      return Math.sqrt(relX * relX + relY * relY) <= radius;
    };

    const generateValidPosition = (side: string): ToppingPosition => {
      let x, y;
      let attempts = 0;
      do {
        if (side === 'full') {
          const angle = Math.random() * 2 * Math.PI;
          const r = Math.sqrt(Math.random()) * radius;
          x = 0.5 + r * Math.cos(angle);
          y = 0.5 + r * Math.sin(angle);
        } else if (side === 'left') {
          const angle = Math.random() * Math.PI + Math.PI/2;
          const r = Math.sqrt(Math.random()) * radius;
          x = 0.5 + r * Math.cos(angle);
          y = 0.5 + r * Math.sin(angle);
        } else { // right
          const angle = Math.random() * Math.PI - Math.PI/2;
          const r = Math.sqrt(Math.random()) * radius;
          x = 0.5 + r * Math.cos(angle);
          y = 0.5 + r * Math.sin(angle);
        }
        attempts++;
      } while (!isInsideCircle(x, y) && attempts < 100);
      
      return { x, y };
    };

    for (let i = 0; i < toppingCount; i++) {
      positions.push(generateValidPosition(placement));
    }

    return positions;
  }, []);

  const handleClear = () => {
    setPizzaToppings([])
    setHasExtraCheese(false)
  }

  const calculateTotal = () => {
    const basePrice = sizePrices[pizzaSize]
    const toppingsPrice = pizzaToppings.reduce((total, topping) => total + topping.price, 0)
    return (basePrice + toppingsPrice).toFixed(2)
  }

  const handleCompleteOrder = () => {
    const total = calculateTotal()
    alert(`Order Summary:
    Size: ${pizzaSize.toUpperCase()}
    Toppings: ${pizzaToppings.map(t => `${t.name} (${t.placement})`).join(', ')}
    Total: $${total}
    
    Thank you for your order!`)
  }

  const renderTopping = (topping: Topping) => {
    if (topping.renderType === 'layer') {
      return (
        <Image
          key={topping.id}
          src={topping.layerImage || topping.image}
          alt={topping.name}
          fill
          className="absolute inset-0 object-cover pointer-events-none"
          style={{
            opacity: 0.8,
            zIndex: topping.zIndex,
          }}
        />
      );
    }

    return topping.positions?.map((position, i) => (
      <Image
        key={`${topping.id}-${i}`}
        src={topping.image}
        alt={topping.name}
        width={40}
        height={40}
        className="absolute w-10 h-10 object-contain pointer-events-none select-none"
        style={{
          left: `${position.x * 100}%`,
          top: `${position.y * 100}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: topping.zIndex,
          backgroundColor: 'transparent',
          mixBlendMode: 'multiply',
          filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.5))',
          opacity: 1
        }}
      />
    ));
  };

  const removeTopping = (toppingId: number) => {
    const topping = pizzaToppings.find(t => t.id === toppingId);
    if (topping?.name === 'Extra cheese') {
      setHasExtraCheese(false);
    }
    setPizzaToppings(pizzaToppings.filter(t => t.id !== toppingId));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-black text-white px-4 lg:px-6 py-4 sm:py-6">
        <div className="container mx-auto flex items-center justify-between">
          <a className="flex items-center justify-center" href="#">
            <UtensilsCrossed className="h-6 w-6 sm:h-8 sm:w-8" />
            <span className="ml-2 text-lg sm:text-xl md:text-2xl font-bold">Pizza Paradise</span>
          </a>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Build Your Perfect Pizza</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 order-1">
            <div className="w-full max-w-md mx-auto aspect-square relative">
              <div 
                ref={pizzaRef}
                className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 overflow-hidden ${
                  pizzaSize === 's' ? 'w-3/4 h-3/4' : pizzaSize === 'm' ? 'w-5/6 h-5/6' : 'w-full h-full'
                }`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="relative w-full h-full">
                  <Image
                    src="/pizza-base.png"
                    alt="Pizza base"
                    fill
                    className="object-contain"
                  />
                  {hasExtraCheese && (
                    <div 
                      className="absolute inset-0 overflow-hidden"
                      style={{
                        clipPath: cheesePlacement === 'left' 
                          ? 'polygon(0 0, 50% 0, 50% 100%, 0 100%)'
                          : cheesePlacement === 'right'
                          ? 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)'
                          : 'none'
                      }}
                    >
                      <Image
                        src="/pizza-cheese.png"
                        alt="Extra cheese"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>
                {pizzaToppings.map((topping) => renderTopping(topping))}
              </div>
            </div>

            <div className="flex justify-center mt-4 space-x-4">
              <Button
                onClick={() => setPizzaSize('s')}
                variant={pizzaSize === 's' ? 'default' : 'outline'}
              >
                S
              </Button>
              <Button
                onClick={() => setPizzaSize('m')}
                variant={pizzaSize === 'm' ? 'default' : 'outline'}
              >
                M
              </Button>
              <Button
                onClick={() => setPizzaSize('l')}
                variant={pizzaSize === 'l' ? 'default' : 'outline'}
              >
                L
              </Button>
            </div>

            <div className="flex justify-center mt-4 space-x-4">
              <Button onClick={() => setToppingPlacement('full')} variant={toppingPlacement === 'full' ? 'default' : 'outline'}>
                Full
              </Button>
              <Button onClick={() => setToppingPlacement('left')} variant={toppingPlacement === 'left' ? 'default' : 'outline'}>
                Left Half
              </Button>
              <Button onClick={() => setToppingPlacement('right')} variant={toppingPlacement === 'right' ? 'default' : 'outline'}>
                Right Half
              </Button>
            </div>

            <div className="mt-4 space-y-4">
              <ScrollArea className="h-32 border rounded-md p-2">
                {pizzaToppings.map((topping) => (
                  <div key={topping.id} className="flex justify-between items-center mb-2">
                    <span>{topping.name} ({topping.placement})</span>
                    <Button variant="ghost" size="sm" onClick={() => topping.id !== undefined && removeTopping(topping.id)}>
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

          <div className="flex-1 order-2 lg:mt-0 mt-8">
            <h2 className="text-2xl font-bold mb-4 text-center lg:text-center">Toppings</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {toppings.map((topping) => (
                <div
                  key={topping.name}
                  className="bg-white p-2 rounded shadow"
                >
                  <div 
                    className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 relative cursor-move touch-none"
                    draggable
                    onDragStart={(e) => handleDragStart(e, topping)}
                    onTouchStart={(e) => handleTouchStart(e, topping)}
                  >
                    <Image 
                      src={topping.image} 
                      alt={topping.name} 
                      width={64}
                      height={64}
                      className="w-full h-full object-contain select-none"
                      style={{ 
                        backgroundColor: 'transparent',
                        mixBlendMode: 'multiply'
                      }}
                    />
                  </div>
                  <p className="text-center text-xs sm:text-sm">{topping.name}</p>
                  <p className="text-center text-xs sm:text-sm text-gray-500">${topping.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      {isDragging && selectedTopping && (
        <div
          ref={draggedToppingRef}
          className="fixed pointer-events-none z-50"
        >
          <Image
            src={selectedTopping.image}
            alt={selectedTopping.name}
            width={64}
            height={64}
            className="w-16 h-16 object-contain select-none"
            style={{ 
              backgroundColor: 'transparent',
              mixBlendMode: 'multiply'
            }}
          />
        </div>
      )}
    </div>
  )
}