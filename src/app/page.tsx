'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UtensilsCrossed, X, Trash2 } from 'lucide-react'
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
  rotation?: number;
}

const sizePrices: Record<string, number> = {
  s: 8,
  m: 10,
  l: 12,
}

export default function PizzaBuilder() {
  const [pizzaSize, setPizzaSize] = useState<string>("m")
  const [pizzaToppings, setPizzaToppings] = useState<Topping[]>([])
  // const [selectedTopping, setSelectedTopping] = useState<Topping | null>(null)
  const [toppingPlacement, setToppingPlacement] = useState<string>("full")
  // const [isDragging, setIsDragging] = useState(false)
  const pizzaRef = useRef<HTMLDivElement>(null)
  // const draggedToppingRef = useRef<HTMLDivElement>(null)
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

  const handleToppingClick = (topping: Topping) => {
    if (!pizzaRef.current) return;
    
    if (topping.name === 'Extra cheese') {
      const existingCheeseIndex = pizzaToppings.findIndex(t => t.name === 'Extra cheese');
      if (existingCheeseIndex !== -1) {
        const updatedToppings = [...pizzaToppings];
        updatedToppings[existingCheeseIndex] = {
          ...topping,
          placement: toppingPlacement,
        };
        setPizzaToppings(updatedToppings);
      } else {
        const newTopping: Topping = {
          ...topping,
          placement: toppingPlacement,
        };
        setPizzaToppings([...pizzaToppings, newTopping]);
      }
      setHasExtraCheese(true);
      setCheesePlacement(toppingPlacement);
      return;
    }

    const existingToppingIndex = pizzaToppings.findIndex(t => t.name === topping.name);
    
    if (existingToppingIndex !== -1) {
      const updatedToppings = [...pizzaToppings];
      updatedToppings[existingToppingIndex] = {
        ...topping,
        placement: toppingPlacement,
        positions: generateToppingPositions(toppingPlacement, topping.renderType),
      };
      setPizzaToppings(updatedToppings);
    } else {
      const newTopping: Topping = {
        ...topping,
        placement: toppingPlacement,
        positions: generateToppingPositions(toppingPlacement, topping.renderType),
      };
      setPizzaToppings([...pizzaToppings, newTopping]);
    }
  };

  const generateToppingPositions = useCallback((placement: string, renderType: 'scattered' | 'layer'): ToppingPosition[] => {
    if (renderType === 'layer') return [];
    
    const toppingCount = 15;
    const radius = 0.35;
    const minRadius = 0.1;

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
          const ring = Math.random() < 0.7 ? 'outer' : 'inner';
          const angle = Math.random() * 2 * Math.PI;
          
          const r = ring === 'outer' 
            ? (0.25 + Math.random() * (radius - 0.25))
            : (minRadius + Math.random() * 0.15);
          
          x = 0.5 + r * Math.cos(angle);
          y = 0.5 + r * Math.sin(angle);
        } else if (side === 'left') {
          const ring = Math.random() < 0.7 ? 'outer' : 'inner';
          const baseAngle = Math.PI;
          const angleSpread = Math.PI;
          const angle = baseAngle + (Math.random() - 0.5) * angleSpread;
          
          const r = ring === 'outer'
            ? (0.25 + Math.random() * (radius - 0.25))
            : (minRadius + Math.random() * 0.15);
          
          x = 0.5 + r * Math.cos(angle);
          y = 0.5 + r * Math.sin(angle);
        } else { // right
          const ring = Math.random() < 0.7 ? 'outer' : 'inner';
          const baseAngle = 0;
          const angleSpread = Math.PI;
          const angle = baseAngle + (Math.random() - 0.5) * angleSpread;
          
          const r = ring === 'outer'
            ? (0.25 + Math.random() * (radius - 0.25))
            : (minRadius + Math.random() * 0.15);
          
          x = 0.5 + r * Math.cos(angle);
          y = 0.5 + r * Math.sin(angle);
        }
        attempts++;
      } while (!isInsideCircle(x, y) && attempts < 100);
      
      return { x, y };
    };

    const addRandomRotation = (position: ToppingPosition): ToppingPosition => {
      return {
        ...position,
        rotation: Math.random() * 360
      };
    };

    const generatePositions = () => {
      const positions = [];
      const outerCount = Math.floor(toppingCount * 0.7);
      for (let i = 0; i < outerCount; i++) {
        positions.push(generateValidPosition(placement));
      }
      const innerCount = toppingCount - outerCount;
      for (let i = 0; i < innerCount; i++) {
        positions.push(generateValidPosition(placement));
      }
      return positions;
    };

    return generatePositions().map(addRandomRotation);
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
        key={`${topping.id}-${i}-${Math.random()}`}
        src={topping.image}
        alt={topping.name}
        width={40}
        height={40}
        className="absolute w-10 h-10 object-contain pointer-events-none select-none"
        style={{
          left: `${position.x * 100}%`,
          top: `${position.y * 100}%`,
          transform: `translate(-50%, -50%) rotate(${position.rotation}deg)`,
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

      <main className="flex-1 container mx-auto px-4 py-4">
        <h1 className="text-3xl font-bold mb-4 text-center">Build Your Perfect Pizza</h1>

        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          <div className="flex-1 flex flex-col items-center">
            <div className="relative w-full max-w-md">
              {pizzaToppings.length > 0 && (
                <Button
                  onClick={handleClear}
                  variant="ghost"
                  size="icon"
                  className="absolute right-[-30px] top-[25%] -translate-y-1/2 hover:bg-red-100 hover:text-red-600 transition-colors w-20 h-20 z-10 !p-0"
                  title="Clear all toppings"
                  style={{
                    minWidth: 'unset',
                    minHeight: 'unset'
                  }}
                >
                  <Trash2 
                    strokeWidth={2}
                    className="w-full h-full"
                    style={{
                      width: '100%',
                      height: '100%',
                      padding: '1.6rem'
                    }}
                  />
                </Button>
              )}
              
              <div className="aspect-square relative">
                <div 
                  ref={pizzaRef}
                  className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 overflow-hidden ${
                    pizzaSize === 's' ? 'w-3/4 h-3/4' : pizzaSize === 'm' ? 'w-5/6 h-5/6' : 'w-full h-full'
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
                          clipPath: cheesePlacement === 'left' 
                            ? 'polygon(0 0, 50% 0, 50% 100%, 0 100%)'
                            : cheesePlacement === 'right'
                            ? 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)'
                            : 'none',
                          transform: 'scale(1.03)',
                          transformOrigin: 'center center'
                        }}
                      >
                        <Image
                          src="/pizza-cheese.png"
                          alt="Extra cheese"
                          fill
                          className="object-cover"
                          style={{
                            transform: 'scale(1)',
                            transformOrigin: 'center center'
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
          </div>

          <div className="flex-1">
            <div className="lg:mt-[30px]">
              <h2 className="text-2xl font-bold mb-4 text-center lg:text-center">Toppings</h2>
              <div className="grid grid-cols-5 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4">
                {toppings.map((topping) => (
                  <div
                    key={topping.name}
                    className="relative p-2 transform transition-transform hover:scale-105"
                  >
                    {/* Metal bowl container */}
                    <div 
                      className="relative w-full aspect-square rounded-full min-w-[50px] max-w-[80px] lg:max-w-[85px] mx-auto"
                      style={{
                        background: 'linear-gradient(145deg, #c8c8c8, #e6e6e6)',
                        boxShadow: `
                          inset 0 4px 8px rgba(0,0,0,0.3),
                          inset 0 -2px 4px rgba(255,255,255,0.4),
                          0 2px 4px rgba(0,0,0,0.2)
                        `,
                        transform: 'perspective(500px) rotateX(10deg)'
                      }}
                    >
                      {/* Inner bowl shadow/highlight */}
                      <div 
                        className="absolute inset-[2px] rounded-full pointer-events-none"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)',
                          border: '1px solid rgba(255,255,255,0.2)'
                        }}
                      />
                      
                      {/* Topping container */}
                      <div 
                        className="absolute inset-0 flex items-center justify-center cursor-pointer"
                        onClick={() => handleToppingClick(topping)}
                      >
                        <div className="w-3/4 h-3/4 relative">
                          <Image 
                            src={topping.image} 
                            alt={topping.name} 
                            width={40}
                            height={40}
                            className="w-full h-full object-contain select-none"
                            style={{ 
                              backgroundColor: 'transparent',
                              mixBlendMode: 'multiply',
                              filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))'
                            }}
                          />
                        </div>
                      </div>

                      {/* Rim highlight */}
                      <div 
                        className="absolute inset-0 rounded-full pointer-events-none"
                        style={{
                          background: 'linear-gradient(45deg, rgba(255,255,255,0.2) 0%, transparent 70%)',
                          border: '1px solid rgba(255,255,255,0.3)'
                        }}
                      />
                    </div>

                    {/* Labels */}
                    <div className="mt-2 text-center">
                      <p className="text-[11px] sm:text-xs font-medium text-gray-700">{topping.name}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">${topping.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex flex-col items-center">
          <div className="w-[300px]">
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

            <div className="flex justify-center mt-4">
              <Button onClick={handleCompleteOrder} variant="default">
                Complete Order (${calculateTotal()})
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 lg:hidden">
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

          <div className="flex justify-center mt-4">
            <Button onClick={handleCompleteOrder} variant="default">
              Complete Order (${calculateTotal()})
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}