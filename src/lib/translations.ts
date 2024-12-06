export const translations = {
  en: {
    title: "Pizza Paradise",
    buildPizza: "Build Your Perfect Pizza",
    toppings: "Toppings",
    sizes: {
      small: "S",
      medium: "M",
      large: "L"
    },
    placement: {
      full: "Full",
      leftHalf: "Left Half",
      rightHalf: "Right Half"
    },
    order: {
      complete: "Complete Order",
      total: "Total",
      confirmOrder: "Confirm Order",
      cancel: "Cancel"
    },
    contact: {
      title: "Complete Your Order",
      name: "Your Name",
      namePlaceholder: "Enter your name",
      phone: "Phone Number",
      phonePlaceholder: "Enter your phone number"
    },
    ai: {
      button: "Order with AI",
      title: "Order with AI Assistant",
      description: "Describe your pizza order to our AI assistant",
      placeholder: "Example: I want a large pizza with pepperoni on the left half and mushrooms on the right half",
      send: "Send Order",
      processing: "Processing..."
    },
    toppingNames: {
      extraCheese: "Extra cheese",
      pepperoni: "Pepperoni",
      mushrooms: "Mushrooms",
      onions: "Onions",
      olives: "Olives",
      bacon: "Bacon",
      sausage: "Sausage",
      blackOlives: "Black olives",
      greenPeppers: "Green peppers",
      tomatoes: "Tomatoes",
      // add any other missing toppings...
    },
    currency: {
      symbol: '$',
      rate: 1
    }
  },
  he: {
    title: "גן עדן של פיצה",
    buildPizza: "בנה את הפיצה המושלמת שלך",
    toppings: "תוספות",
    sizes: {
      small: "S",
      medium: "M",
      large: "L"
    },
    placement: {
      full: "מלא",
      leftHalf: "חצי שמאל",
      rightHalf: "חצי ימין"
    },
    order: {
      complete: "השלם הזמנה",
      total: "סה״כ",
      confirmOrder: "אשר הזמנה",
      cancel: "ביטול"
    },
    contact: {
      title: "השלם את ההזמנה",
      name: "שם מלא",
      namePlaceholder: "הכנס את שמך",
      phone: "מספר טלפון",
      phonePlaceholder: "הכנס מספר טלפון"
    },
    ai: {
      button: "הזמן עם AI",
      title: '<div class="flex flex-row-reverse gap-2">הזמנה בעזרת <span>AI</span></div>',
      description: '<div class="flex flex-row-reverse gap-2">תאר את הזמנת הפיצה לעוזר שלנו בעזרת <span>AI</span></div>',
      placeholder: "דוגמה: אני רוצה פיצה גדולה עם פפרוני בחצי שמאל ופטריות בחצי ימין",
      send: "שלח הזמנה",
      processing: "מעבד..."
    },
    toppingNames: {
      extraCheese: "תוספת גבינה",
      pepperoni: "פפרוני",
      mushrooms: "פטריות",
      onions: "בצל",
      olives: "זיתים",
      bacon: "בייקון",
      sausage: "נקניקיות",
      blackOlives: "זיתים שחורים",
      greenPeppers: "פלפל ירוק",
      tomatoes: "עגבניות",
      // add any other missing toppings...
    },
    currency: {
      symbol: '₪',
      rate: 3.7
    }
  }
};

export type Language = 'en' | 'he'; 