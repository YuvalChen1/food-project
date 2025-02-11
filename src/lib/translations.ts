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
      phonePlaceholder: "Enter your phone number",
      description: "Please provide your contact details to complete the order"
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
      "Extra cheese": "Extra cheese",
      "Pepperoni": "Pepperoni",
      "Mushrooms": "Mushrooms",
      "Onions": "Onions",
      "Black olives": "Black olives",
      "Green peppers": "Green peppers",
      "Tomatoes": "Tomatoes",
      "Olives": "Olives",
      "Bacon": "Bacon",
      "Sausage": "Sausage",
      "Pineapple": "Pineapple"
    },
    currency: {
      symbol: '$',
      rate: 1
    },
    orderStatus: {
      pending: "Pending",
      completed: "Completed",
      cancelled: "Cancelled"
    },
    dashboard: {
      title: "Staff Dashboard",
      logout: "Logout",
      labels: {
        status: "Status",
        customer: "Customer",
        phone: "Phone",
        time: "Time",
        price: "Price",
        toppings: "Toppings",
        noToppings: "No toppings",
        actions: "Actions",
        orderNumber: "Order #",
        size: "Size",
        total: "Total"
      },
      actions: {
        prepare: "Prepare",
        ready: "Ready",
        complete: "Complete"
      },
      trends: {
        popularity: "Popularity",
        activeDays: "Active for",
        requestsPerDay: "requests/day",
        days: "days",
        recommendation: "Consider adding to menu"
      },
      exportDaily: "Export Daily Report",
      exportMonthly: "Export Monthly Report",
      statuses: {
      }
    }
  },
  he: {
    title: "גן עדן של פיצה",
    buildPizza: "בנה את הפיצה המושלמת שלך",
    toppings: "תוספות",
    sizes: {
      small: "קטן",
      medium: "בינוני",
      large: "גדול",
      s: "קטן",
      m: "בינוני",
      l: "גדול"
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
      phonePlaceholder: "הכנס מספר טלפון",
      description: "אנא הזן את פרטי ההתקשרות שלך להשלמת ההזמנה"
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
      "Extra cheese": "תוספת גבינה",
      "Pepperoni": "פפרוני",
      "Mushrooms": "פטריות",
      "Onions": "בצל",
      "Black olives": "זיתים שחורים",
      "Green peppers": "פלפל ירוק",
      "Tomatoes": "עגבניות",
      "Olives": "זיתים",
      "Bacon": "בייקון",
      "Sausage": "נקניקיות",
      "Pineapple": "אננס"
    },
    currency: {
      symbol: '₪',
      rate: 3.7
    },
    orderStatus: {
      pending: "ממתין",
      preparing: "בהכנה",
      ready: "מוכן",
      completed: "הושלם",
      cancelled: "בוטל"
    },
    dashboard: {
      title: "לוח בקרה",
      logout: "התנתק",
      labels: {
        status: "סטטוס",
        customer: "לקוח",
        phone: "טלפון",
        time: "זמן",
        price: "מחיר",
        toppings: "תוספות",
        noToppings: "ללא תוספות",
        actions: "פעולות",
        orderNumber: "הזמנה מס'",
        size: "גודל",
        total: "סה״כ"
      },
      actions: {
        prepare: "התחל הכנה",
        ready: "מוכן לאיסוף",
        complete: "השלם הזמנה"
      },
      trends: {
        popularity: "פופולריות",
        activeDays: "פעיל במשך",
        requestsPerDay: "בקשות ליום",
        days: "ימים",
        recommendation: "שקול להוסיף לתפריט"
      },
      exportDaily: "ייצוא דוח יומי",
      exportMonthly: "ייצוא דוח חודשי",
      statuses: {
      }
    }
  }
};

export type Language = 'en' | 'he'; 