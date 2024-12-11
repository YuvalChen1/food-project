import {
  trackUnavailableToppingRequest,
  trackToppingUsage,
} from "./orderAnalysis";

interface ToppingWithPlacement {
  name: string;
  placement: string;
}

export interface AIOrderResponse {
  size: string;
  toppings: ToppingWithPlacement[];
  customerName?: string;
  phoneNumber?: string;
}

// Helper function to determine placement for a specific topping
const getToppingPlacement = (
  msg: string,
  toppingHebrew: string,
  toppingEnglish: string
) => {
  // Find the position of the topping mention
  const toppingIndex =
    msg.indexOf(toppingHebrew) !== -1
      ? msg.indexOf(toppingHebrew)
      : msg.indexOf(toppingEnglish);

  // Look for direction words only after the topping mention
  const textAfterTopping = msg.slice(toppingIndex);

  if (textAfterTopping.includes("שמאל") || textAfterTopping.includes("left")) {
    return "left";
  } else if (
    textAfterTopping.includes("ימין") ||
    textAfterTopping.includes("right")
  ) {
    return "right";
  }
  return "full";
};

export const processAIOrder = async (message: string) => {
  const msg = message.toLowerCase();

  // Check for pineapple in both languages
  if (msg.includes("pineapple") || msg.includes("אננס")) {
    await trackUnavailableToppingRequest("Pineapple");
    throw new Error(
      msg.includes("אננס")
        ? "מצטערים, אננס אינו זמין כרגע כתוספת. רשמנו את בקשתך!"
        : "Sorry, pineapple is not currently available as a topping. We have noted your request!"
    );
  }

  // Parse size from message
  let size = "medium";
  if (msg.includes("large") || msg.includes("גדול") || msg.includes("גדולה")) {
    size = "large";
  } else if (
    msg.includes("small") ||
    msg.includes("קטן") ||
    msg.includes("קטנה")
  ) {
    size = "small";
  }

  // Parse toppings and their placements
  const toppingsWithPlacements: ToppingWithPlacement[] = [];

  // Check for pepperoni in both languages
  if (msg.includes("pepperoni") || msg.includes("פפרוני")) {
    if (msg.includes("left") || msg.includes("שמאל")) {
      toppingsWithPlacements.push({ name: "Pepperoni", placement: "left" });
    } else if (msg.includes("right") || msg.includes("ימין")) {
      toppingsWithPlacements.push({ name: "Pepperoni", placement: "right" });
    } else {
      toppingsWithPlacements.push({ name: "Pepperoni", placement: "full" });
    }
  }

  // Check for mushrooms in both languages
  if (msg.includes("mushroom") || msg.includes("פטריות")) {
    const placement = getToppingPlacement(msg, "פטריות", "mushroom");
    toppingsWithPlacements.push({ name: "Mushrooms", placement });
  }

  // Check for onions in both languages
  if (msg.includes("onion") || msg.includes("בצל")) {
    const placement = getToppingPlacement(msg, "בצל", "onion");
    toppingsWithPlacements.push({ name: "Onions", placement });
  }

  // Check for olives in both languages
  if (msg.includes("olive") || msg.includes("זיתים")) {
    if (msg.includes("right") || msg.includes("ימין")) {
      toppingsWithPlacements.push({ name: "Black olives", placement: "right" });
    } else if (msg.includes("left") || msg.includes("שמאל")) {
      toppingsWithPlacements.push({ name: "Black olives", placement: "left" });
    } else {
      toppingsWithPlacements.push({ name: "Black olives", placement: "full" });
    }
  }

  // Check for green peppers in both languages
  if (
    (msg.includes("green") && msg.includes("pepper")) ||
    msg.includes("פלפל ירוק")
  ) {
    if (msg.includes("right") || msg.includes("ימין")) {
      toppingsWithPlacements.push({
        name: "Green peppers",
        placement: "right",
      });
    } else if (msg.includes("left") || msg.includes("שמאל")) {
      toppingsWithPlacements.push({ name: "Green peppers", placement: "left" });
    } else {
      toppingsWithPlacements.push({ name: "Green peppers", placement: "full" });
    }
  }

  // Check for tomatoes in both languages
  if (msg.includes("tomato") || msg.includes("עגבני")) {
    if (msg.includes("right") || msg.includes("ימין")) {
      toppingsWithPlacements.push({ name: "Tomatoes", placement: "right" });
    } else if (msg.includes("left") || msg.includes("שמאל")) {
      toppingsWithPlacements.push({ name: "Tomatoes", placement: "left" });
    } else {
      toppingsWithPlacements.push({ name: "Tomatoes", placement: "full" });
    }
  }

  // Track each topping usage
  for (const topping of toppingsWithPlacements) {
    await trackToppingUsage(topping.name, topping.placement);
  }

  const mockResponse = {
    size: size,
    toppings: toppingsWithPlacements,
    customerName: "",
    phoneNumber: "",
  };

  await new Promise((resolve) => setTimeout(resolve, 1500));
  console.log("AI Order Request:", message);
  console.log("AI Order Response:", mockResponse);

  return mockResponse;
};
