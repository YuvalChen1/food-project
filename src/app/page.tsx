"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, X, Trash2, Mic, MicOff } from "lucide-react";
import { toppings, ToppingType } from "@/data/toppings";
import Swal from "sweetalert2";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/firebase/config";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { processAIOrder } from '@/lib/aiOrderHandler';
import { trackUnavailableToppingRequest } from '@/lib/orderAnalysis';
import { translations, type Language } from '@/lib/translations';

interface Topping extends ToppingType {
  x?: number;
  y?: number;
  placement?: string;
  positions?: ToppingPosition[];
}

interface ToppingPosition {
  x: number;
  y: number;
  rotation: number;
  clipPath?: string;
}

const sizePrices: Record<string, number> = {
  s: 8,
  m: 10,
  l: 12,
};

interface OrderData {
  size: string;
  toppings: any[];
  totalPrice: number;
  timestamp: Date;
  status: "pending";
  customerName: string;
  phoneNumber: string;
}

export default function PizzaBuilder() {
  const [pizzaSize, setPizzaSize] = useState<string>("m");
  const [pizzaToppings, setPizzaToppings] = useState<Topping[]>([]);
  // const [selectedTopping, setSelectedTopping] = useState<Topping | null>(null)
  // const [isDragging, setIsDragging] = useState(false)
  const pizzaRef = useRef<HTMLDivElement>(null);
  // const draggedToppingRef = useRef<HTMLDivElement>(null)
  const [hasExtraCheese, setHasExtraCheese] = useState(false);
  const [cheesePlacement, setCheesePlacement] = useState<string>("full");
  const [isLoading, setIsLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiMessage, setAIMessage] = useState("");
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState<Language>('he');
  const [activeToppingForPlacement, setActiveToppingForPlacement] = useState<Topping | null>(null);

  useEffect(() => {
    const preventDefault = (e: Event) => e.preventDefault();
    document.addEventListener("gesturestart", preventDefault, {
      passive: false,
    });
    document.addEventListener("gesturechange", preventDefault, {
      passive: false,
    });
    document.addEventListener("gestureend", preventDefault, { passive: false });
    return () => {
      document.removeEventListener("gesturestart", preventDefault);
      document.removeEventListener("gesturechange", preventDefault);
      document.removeEventListener("gestureend", preventDefault);
    };
  }, []);

  const handleToppingClick = (topping: Topping) => {
    if (!pizzaRef.current) return;
    
    // If it's already on the pizza, remove it
    if (pizzaToppings.some(t => t.name === topping.name)) {
      setPizzaToppings(pizzaToppings.filter(t => t.name !== topping.name));
      if (topping.name === "Extra cheese") {
        setHasExtraCheese(false);
      }
      return;
    }

    // Show placement popup
    setActiveToppingForPlacement(topping);
  };

  const generateOnionClipPath = () => {
    // Weighted array with many more broken/partial shapes
    const types = [
      'broken', 'broken', 'broken', 'broken', 'broken',  // 5 broken
      'half', 'half', 'half',                           // 3 half
      'three-quarters', 'three-quarters',               // 2 three-quarters
      'full'                                           // Only 1 full
    ];
    const type = types[Math.floor(Math.random() * types.length)];
    
    switch(type) {
      case 'three-quarters':
        return 'polygon(0 0, 100% 0, 100% 100%, 75% 100%, 75% 25%, 0 25%)';
      case 'half':
        return 'polygon(0 0, 100% 0, 100% 50%, 0 50%)';
      case 'broken':
        return 'polygon(25% 0, 100% 0, 100% 75%, 75% 75%, 75% 25%, 25% 25%)';
      default:
        return 'none';
    }
  };

  const generatePepperClipPath = () => {
    // Weighted array heavily favoring partial cuts
    const types = [
      'partial', 'partial', 'partial', 'partial', 'partial',  // 5
      'partial', 'partial', 'partial', 'partial', 'partial',  // 10
      'diagonal', 'diagonal', 'diagonal',                     // 13
      'half', 'half',                                        // 15
      'full'                                                 // 16 total, only 1 full
    ];
    const type = types[Math.floor(Math.random() * types.length)];
    
    switch(type) {
      case 'diagonal':
        return 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)';
      case 'half':
        return 'polygon(0 0, 100% 0, 100% 50%, 0 50%)';
      case 'partial':
        // More aggressive partial cuts
        const startX = Math.floor(Math.random() * 40) + 30;  // 30-70%
        const endX = Math.floor(Math.random() * 20) + 80;    // 80-100%
        const cutY = Math.floor(Math.random() * 30) + 35;    // 35-65%
        return `polygon(${startX}% 0, ${endX}% 0, ${endX}% ${cutY}%, ${startX}% 100%, 0 100%, 0 ${cutY}%)`;
      default:
        return 'none';
    }
  };

  const generateToppingPositions = useCallback(
    (placement: string, renderType: "scattered" | "layer", toppingName: string): ToppingPosition[] => {
      if (renderType === "layer") return [];

      const outerRadius = 0.33;
      const innerRadius = 0.12;
      const centerX = 0.5;
      const centerY = 0.5;
      const safetyMargin = 0.02;

      const isInsideValidArea = (x: number, y: number, side: string) => {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Check if point is within the valid pizza area
        if (distance > outerRadius || distance < innerRadius) return false;
        
        // For half placements
        if (side === "left" && x > centerX) return false;
        if (side === "right" && x < centerX) return false;

        return true;
      };

      const generateValidPosition = (side: string): ToppingPosition => {
        let x, y, rotation;
        let attempts = 0;
        
        do {
          const angle = Math.random() * Math.PI * 2;
          const r = Math.sqrt(Math.random()) * (outerRadius - innerRadius - safetyMargin) + innerRadius;
          
          x = centerX + r * Math.cos(angle);
          y = centerY + r * Math.sin(angle);
          
          rotation = Math.random() * 360;
          
          attempts++;
        } while (!isInsideValidArea(x, y, side) && attempts < 100);

        // Tighter bounds
        x = Math.max(0.18, Math.min(0.82, x));
        y = Math.max(0.18, Math.min(0.82, y));

        return { x, y, rotation };
      };

      const positions: ToppingPosition[] = [];
      
      if (placement === "full") {
        // More varied ring configuration for full pizza
        const rings = [
          { count: 8, radius: outerRadius * (0.85 + Math.random() * 0.1) },   // Outer ring
          { count: 7, radius: outerRadius * (0.65 + Math.random() * 0.1) },   // Middle-outer ring
          { count: 6, radius: outerRadius * (0.45 + Math.random() * 0.1) },   // Middle-inner ring
          { count: 4, radius: outerRadius * (0.25 + Math.random() * 0.1) }    // Inner ring
        ];

        rings.forEach(ring => {
          for (let i = 0; i < ring.count; i++) {
            // Add more randomization to angle and radius
            const baseAngle = (i / ring.count) * Math.PI * 2;
            const angleVariation = (Math.random() * 0.5 - 0.25) * (Math.PI / ring.count);
            const angle = baseAngle + angleVariation;
            
            // More varied radius
            const radiusVariation = ring.radius * (0.85 + Math.random() * 0.3);
            
            const x = centerX + Math.cos(angle) * radiusVariation;
            const y = centerY + Math.sin(angle) * radiusVariation;
            
            // More varied rotation
            const rotation = Math.random() * 360;

            if (x >= 0.18 && x <= 0.82 && y >= 0.18 && y <= 0.82) {
              // Add slight offset to prevent perfect stacking
              const offsetX = (Math.random() * 0.06 - 0.03);
              const offsetY = (Math.random() * 0.06 - 0.03);
              
              positions.push({ 
                x: x + offsetX, 
                y: y + offsetY, 
                rotation,
                clipPath: toppingName === "Onions" ? generateOnionClipPath() : 
                         toppingName === "Green peppers" ? generatePepperClipPath() :
                         undefined
              });
            }
          }
        });
      } else {
        // Similar updates for half pizzas
        const halfRings = [
          { count: 5, radius: outerRadius * (0.85 + Math.random() * 0.1) },
          { count: 4, radius: outerRadius * (0.65 + Math.random() * 0.1) },
          { count: 3, radius: outerRadius * (0.45 + Math.random() * 0.1) },
          { count: 2, radius: outerRadius * (0.25 + Math.random() * 0.1) }
        ];

        const baseAngle = placement === "left" ? Math.PI : 0;
        
        halfRings.forEach(ring => {
          for (let i = 0; i < ring.count; i++) {
            const baseRingAngle = (i / ring.count) * Math.PI - Math.PI/2;
            const angleVariation = (Math.random() * 0.4 - 0.2);
            const angle = baseAngle + baseRingAngle + angleVariation;
            
            const radiusVariation = ring.radius * (0.85 + Math.random() * 0.3);
            
            const x = centerX + Math.cos(angle) * radiusVariation;
            const y = centerY + Math.sin(angle) * radiusVariation;
            
            const rotation = Math.random() * 360;

            if (x >= 0.18 && x <= 0.82 && y >= 0.18 && y <= 0.82) {
              const offsetX = (Math.random() * 0.06 - 0.03);
              const offsetY = (Math.random() * 0.06 - 0.03);
              
              positions.push({ 
                x: x + offsetX, 
                y: y + offsetY, 
                rotation,
                clipPath: toppingName === "Onions" ? generateOnionClipPath() : 
                         toppingName === "Green peppers" ? generatePepperClipPath() :
                         undefined
              });
            }
          }
        });
      }

      return positions;
    },
    []
  );

  const handleClear = () => {
    setPizzaToppings([]);
    setHasExtraCheese(false);
  };

  const calculateTotal = () => {
    const basePrice = sizePrices[pizzaSize];
    const toppingsPrice = pizzaToppings.reduce(
      (total, topping) => total + topping.price,
      0
    );
    return Number((basePrice + toppingsPrice).toFixed(2));
  };

  const handleOrderClick = () => {
    setShowContactModal(true);
  };

  const handleCompleteOrder = async () => {
    try {
      setIsLoading(true);

      // Validate contact details
      if (!customerName.trim() || !phoneNumber.trim()) {
        await Swal.fire({
          title: "Missing Information",
          text: "Please provide your name and phone number",
          icon: "error",
          confirmButtonColor: "#d33",
          allowOutsideClick: false,
          willOpen: () => {
            setShowContactModal(false);
          },
          willClose: () => {
            setShowContactModal(true);
          }
        });
        return;
      }

      const orderData: OrderData = {
        size: pizzaSize.toUpperCase(),
        toppings: pizzaToppings.map((t) => ({
          name: t.name,
          placement: t.placement,
          price: t.price,
        })),
        totalPrice: calculateTotal(),
        timestamp: new Date(),
        status: "pending",
        customerName: customerName.trim(),
        phoneNumber: phoneNumber.trim(),
      };

      await addDoc(collection(db, "orders"), orderData);
      setShowContactModal(false);

      await Swal.fire({
        title: "Success!",
        text: "Your order has been placed successfully. You will receive updates via SMS.",
        icon: "success",
        confirmButtonColor: "#3085d6",
      });

      // Clear form
      setPizzaToppings([]);
      setHasExtraCheese(false);
      setPizzaSize("m");
      setCustomerName("");
      setPhoneNumber("");
    } catch (error) {
      console.error("Error adding order:", error);
      await Swal.fire({
        title: "Error",
        text: "Failed to place order. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderTopping = useCallback((topping: Topping) => {
    if (topping.name === "Extra cheese") {
      return null;
    }

    return topping.positions?.map((pos, idx) => (
      <div
        key={`${topping.name}-${idx}`}
        className="absolute"
        style={{
          left: `${pos.x * 100}%`,
          top: `${pos.y * 100}%`,
          transform: `translate(-50%, -50%) rotate(${pos.rotation}deg) scale(${
            topping.name === "Black olives" ? 0.5 : 
            topping.name === "Onions" ? 0.8 :
            topping.name === "Mushrooms" ? 0.7 :
            topping.name === "Green peppers" ? 0.85 : 
            topping.name === "Tomatoes" ? 1.6 : 
            0.85
          })`,
          width: "40px",
          height: "40px",
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            clipPath: pos.clipPath || 'none',
          }}
        >
          <Image
            src={topping.renderImage || topping.image}
            alt={topping.name}
            width={40}
            height={40}
            className="w-full h-full object-contain select-none"
            style={{
              filter: "drop-shadow(2px 2px 2px rgba(0,0,0,0.2))",
              mixBlendMode: "multiply",
            }}
            priority
          />
        </div>
      </div>
    ));
  }, []);

  const removeTopping = (toppingId: number) => {
    const topping = pizzaToppings.find((t) => t.id === toppingId);
    if (topping?.name === "Extra cheese") {
      setHasExtraCheese(false);
    }
    setPizzaToppings(pizzaToppings.filter((t) => t.id !== toppingId));
  };

  const handleAIChat = async () => {
    if (!aiMessage.trim()) return;

    try {
      setIsProcessingAI(true);
      const orderDetails = await processAIOrder(aiMessage);
      
      // Set pizza size
      setPizzaSize(orderDetails.size.toLowerCase());
      
      // Add toppings
      const newToppings = orderDetails.toppings.map(toppingName => {
        const topping = toppings.find(t => t.name.toLowerCase() === toppingName.toLowerCase());
        if (!topping) {
          trackUnavailableToppingRequest(toppingName);
          return null;
        }
        return {
          ...topping,
          placement: orderDetails.placement || 'full',
          positions: generateToppingPositions(orderDetails.placement || 'full', topping.renderType, topping.name)
        };
      }).filter(t => t !== null);

      setPizzaToppings(newToppings as Topping[]);
      
      if (orderDetails.customerName) {
        setCustomerName(orderDetails.customerName);
      }
      if (orderDetails.phoneNumber) {
        setPhoneNumber(orderDetails.phoneNumber);
      }

      setAIMessage("");
      setShowAIChat(false);
      
      await Swal.fire({
        title: "Success!",
        text: "AI processed your order",
        icon: "success",
      });
    } catch (error) {
      console.error("Error processing AI chat:", error);
      await Swal.fire({
        title: "Error",
        text: "Failed to process AI order",
        icon: "error",
      });
    } finally {
      setIsProcessingAI(false);
    }
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'he' ? 'he-IL' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setAIMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert('Speech recognition is not supported in this browser.');
    }
  };

  const getToppingTranslation = (name: string) => {
    const key = name.toLowerCase()
      .split(' ')
      .map((word, index) => 
        index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join('') as keyof typeof translations.en.toppingNames;
    
    return translations[language].toppingNames[key] || name;
  };

  // Helper function for price conversion
  const formatPrice = (price: number) => {
    const rate = translations[language].currency.rate;
    const symbol = translations[language].currency.symbol;
    return `${symbol}${(price * rate).toFixed(2)}`;
  };

  // Fix the order button price format
  const formatOrderPrice = (price: number) => {
    const formattedPrice = formatPrice(price);
    return language === 'he' ? `(${formattedPrice})` : `(${formattedPrice})`;
  };

  const handlePlacementSelect = (placement: string) => {
    if (!activeToppingForPlacement) return;

    // Generate positions only when adding the topping
    const existingTopping = pizzaToppings.find(t => t.name === activeToppingForPlacement.name);
    
    // If topping exists, use its positions (shouldn't happen due to our click handler, but just in case)
    if (existingTopping) {
      setActiveToppingForPlacement(null);
      return;
    }

    // Generate new positions only for new topping
    const newTopping: Topping = {
      ...activeToppingForPlacement,
      placement,
      positions: generateToppingPositions(
        placement,
        activeToppingForPlacement.renderType,
        activeToppingForPlacement.name
      ),
    };

    setPizzaToppings([...pizzaToppings, newTopping]);
    if (activeToppingForPlacement.name === "Extra cheese") {
      setHasExtraCheese(true);
      setCheesePlacement(placement);
    }
    
    setActiveToppingForPlacement(null);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (activeToppingForPlacement) {
        const target = e.target as HTMLElement;
        if (!target.closest('.topping-placement-popup')) {
          setActiveToppingForPlacement(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeToppingForPlacement]);

  return (
    <div className={`flex flex-col min-h-screen overflow-x-hidden ${language === 'he' ? 'rtl' : 'ltr'}`}>
      <header className="bg-black text-white px-4 lg:px-6 py-4 sm:py-6">
        <div className="container mx-auto flex items-center justify-between">
          <a className="flex items-center justify-center" href="#">
            <UtensilsCrossed className="h-6 w-6 sm:h-8 sm:w-8" />
            <span className="ml-2 text-lg sm:text-xl md:text-2xl font-bold">
              {translations[language].title}
            </span>
          </a>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === 'en' ? 'he' : 'en')}
            className="text-white hover:text-white border-white hover:bg-white/10 bg-transparent"
          >
            {language === 'en' ? 'עברית' : 'English'}
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 mt-2 text-center whitespace-nowrap">
          {translations[language].buildPizza}
        </h1>

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
                      padding: "1.6rem",
                    }}
                  />
                </Button>
              )}

              <div className="aspect-square relative">
                <div
                  ref={pizzaRef}
                  className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 overflow-hidden ${
                    pizzaSize === "s"
                      ? "w-3/4 h-3/4"
                      : pizzaSize === "m"
                      ? "w-5/6 h-5/6"
                      : "w-full h-full"
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
                            transform: "scale(1)",
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

            <div className="flex justify-center mt-4 space-x-4">
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
          </div>

          <div className="flex-1">
            <div className="lg:mt-[30px]">
              <h2 className="text-2xl font-bold mb-4 text-center lg:text-center">
                {translations[language].toppings}
              </h2>
              <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4">
                {toppings.map((topping) => (
                  <div
                    key={topping.name}
                    className="relative"
                  >
                    {activeToppingForPlacement?.name === topping.name && (
                      <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 z-50 topping-placement-popup">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent event bubbling
                              handlePlacementSelect('full');
                            }}
                            className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-blue-500 transition-colors"
                            title="Full"
                          >
                            <div className="w-full h-full rounded-full bg-gray-200 hover:bg-blue-100" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent event bubbling
                              handlePlacementSelect('left');
                            }}
                            className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-blue-500 transition-colors overflow-hidden"
                            title="Left Half"
                          >
                            <div className="w-1/2 h-full bg-gray-200 hover:bg-blue-100" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent event bubbling
                              handlePlacementSelect('right');
                            }}
                            className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-blue-500 transition-colors overflow-hidden"
                            title="Right Half"
                          >
                            <div className="w-1/2 h-full bg-gray-200 hover:bg-blue-100 ml-auto" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className={`relative p-2 sm:p-3 flex flex-col items-center transform transition-transform hover:scale-105 ${
                      pizzaToppings.some(t => t.name === topping.name) ? 
                      'ring-2 ring-blue-500 ring-offset-2 sm:ring-offset-4 rounded-full bg-blue-50' : ''
                    }`}
                    >
                      {/* Add placement indicator */}
                      {pizzaToppings.some(t => t.name === topping.name) && (
                        <div className="absolute top-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center transform translate-x-1/3 -translate-y-1/3 shadow-md">
                          {pizzaToppings.find(t => t.name === topping.name)?.placement === 'full' ? (
                            <div className="w-4 h-4 rounded-full bg-black" />
                          ) : pizzaToppings.find(t => t.name === topping.name)?.placement === 'left' ? (
                            <div className="w-4 h-4 rounded-full overflow-hidden bg-white">
                              <div className="w-1/2 h-full bg-black" />  {/* Left half black */}
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full overflow-hidden bg-white">
                              <div className="w-1/2 h-full bg-black float-right" />  {/* Right half black */}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Metal bowl container */}
                      <div
                        className={`relative w-[85%] aspect-square rounded-full min-w-[45px] sm:min-w-[50px] max-w-[70px] sm:max-w-[80px] lg:max-w-[85px] mx-auto ${
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
                        {/* Inner bowl shadow/highlight */}
                        <div
                          className="absolute inset-[2px] rounded-full pointer-events-none"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)",
                            border: "1px solid rgba(255,255,255,0.2)",
                          }}
                        />

                        {/* Topping container */}
                        <div
                          className="absolute inset-0 flex items-center justify-center cursor-pointer"
                          onClick={() => handleToppingClick(topping)}
                        >
                          <div className={`w-[85%] h-[85%] relative ${  // Increased from w-3/4 h-3/4
                            topping.name === "Tomatoes" ? "scale-125" : ""  // Special scale for tomatoes
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

                        {/* Rim highlight */}
                        <div
                          className="absolute inset-0 rounded-full pointer-events-none"
                          style={{
                            background:
                              "linear-gradient(45deg, rgba(255,255,255,0.2) 0%, transparent 70%)",
                            border: "1px solid rgba(255,255,255,0.3)",
                          }}
                        />
                      </div>

                      {/* Labels */}
                      <div className="mt-2 text-center">
                        <p className="text-[11px] sm:text-xs font-medium text-gray-700">
                          {getToppingTranslation(topping.name)}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-500">
                          {formatPrice(topping.price)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Comment out the toppings list section */}
        {/* 
        <div className="hidden lg:flex flex-col items-center">
          <div className="w-[300px]">
            <ScrollArea className="h-32 border rounded-md p-2">
              {pizzaToppings.map((topping) => (
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
                    onClick={() =>
                      topping.id !== undefined && removeTopping(topping.id)
                    }
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </ScrollArea>
          </div>
        </div>
        */}

        {/* Add back the order button for desktop */}
        <div className="hidden lg:flex justify-center mt-4">
          <Button
            onClick={handleOrderClick}
            variant="default"
            className="relative"
          >
            {language === 'he' 
              ? `${translations[language].order.complete} ${formatOrderPrice(calculateTotal())}`
              : `${translations[language].order.complete} ${formatOrderPrice(calculateTotal())}`
            }
          </Button>
        </div>

        {/* Comment out the mobile toppings list */}
        {/* 
        <div className="flex-1 lg:hidden">
          <ScrollArea className="h-32 border rounded-md p-2">
            {pizzaToppings.map((topping) => (
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
                  onClick={() =>
                    topping.id !== undefined && removeTopping(topping.id)
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </ScrollArea>

          <div className="flex justify-center mt-4">
            <Button
              onClick={handleOrderClick}
              variant="default"
              className="relative"
            >
              {translations[language].order.complete} (${calculateTotal()})
            </Button>
          </div>
        </div>
        */}

        {/* Mobile order button */}
        <div className="flex lg:hidden justify-center mb-20 mt-4">
          <Button
            onClick={handleOrderClick}
            variant="default"
            className="relative"
          >
            {language === 'he' 
              ? `${translations[language].order.complete} ${formatOrderPrice(calculateTotal())}`
              : `${translations[language].order.complete} ${formatOrderPrice(calculateTotal())}`
            }
          </Button>
        </div>
      </main>

      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className={`sm:max-w-[425px] ${language === 'he' ? 'rtl text-right [&>button]:left-4 [&>button]:right-auto' : 'ltr text-left'}`}>
          <DialogHeader className={`${language === 'he' ? 'ml-8' : 'mr-8'}`}>
            <DialogTitle className={language === 'he' ? 'text-right' : 'text-left'}>
              {translations[language].contact.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {translations[language].contact.name}
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={`w-full p-2 border rounded-md ${language === 'he' ? 'text-right' : 'text-left'}`}
                placeholder={translations[language].contact.namePlaceholder}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {translations[language].contact.phone}
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={`w-full p-2 border rounded-md ${language === 'he' ? 'text-right' : 'text-left'}`}
                placeholder={translations[language].contact.phonePlaceholder}
                required
              />
            </div>
            <div className={`flex ${language === 'he' ? 'flex-row-reverse' : ''} justify-end space-x-2 pt-4`}>
              <Button variant="outline" onClick={() => setShowContactModal(false)}>
                {translations[language].order.cancel}
              </Button>
              <Button onClick={handleCompleteOrder} disabled={isLoading}>
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  translations[language].order.confirmOrder
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Button
        onClick={() => setShowAIChat(true)}
        className="fixed bottom-6 right-4 rounded-full bg-blue-500 hover:bg-blue-600 text-white z-50"
      >
        {language === 'he' ? '🤖 AI הזמן עם ' : '🤖 Order with AI'}
      </Button>

      <Dialog open={showAIChat} onOpenChange={setShowAIChat}>
        <DialogContent className={`sm:max-w-[425px] ${language === 'he' ? 'rtl text-right' : 'ltr text-left'}`}>
          <DialogHeader className={`${language === 'he' ? 'ml-8' : 'mr-8'}`}>
            <DialogTitle 
              className={language === 'he' ? 'text-right' : 'text-left'}
              dangerouslySetInnerHTML={{ __html: translations[language].ai.title }}
            />
            <DialogDescription 
              className={language === 'he' ? 'text-right' : 'text-left'}
              dangerouslySetInnerHTML={{ __html: translations[language].ai.description }}
            />
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <textarea
                  value={aiMessage}
                  onChange={(e) => setAIMessage(e.target.value)}
                  placeholder={translations[language].ai.placeholder}
                  className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    language === 'he' ? 'text-right' : 'text-left'
                  }`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={`absolute ${language === 'he' ? 'left-2' : 'right-2'} bottom-2`}
                  onClick={startListening}
                  disabled={isListening}
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4 text-red-500 animate-pulse" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button 
                onClick={handleAIChat} 
                disabled={isProcessingAI || !aiMessage.trim()}
              >
                {isProcessingAI ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {translations[language].ai.processing}
                  </div>
                ) : (
                  translations[language].ai.send
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
