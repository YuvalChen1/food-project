"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { he } from 'date-fns/locale';
import { translations } from "@/lib/translations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { analyzeTrends } from '@/lib/orderAnalysis';

interface Order {
  id: string;
  size: string;
  toppings: any[];
  totalPrice: number;
  timestamp: Date;
  status: "pending" | "preparing" | "ready" | "completed";
  customerName: string;
  phoneNumber: string;
}

export default function StaffDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trends, setTrends] = useState<any[]>([]);
  const [isHebrew, setIsHebrew] = useState(true);

  useEffect(() => {
    loadTrends();
    const q = query(collection(db, "orders"), orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orderData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Order, 'id' | 'timestamp'>),
        timestamp: doc.data().timestamp?.toDate(),
      })) as Order[];

      setOrders(orderData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadTrends = async () => {
    try {
      const trendData = await analyzeTrends();
      setTrends(trendData);
    } catch (error) {
      console.error("Error loading trends:", error);
    }
  };

  const sendSMSNotification = async (phoneNumber: string, message: string) => {
    try {
      const response = await fetch("/api/send-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber, message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to send SMS");
      }

      return data;
    } catch (error) {
      console.error("Detailed SMS error:", error);
      throw error;
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      const order = orders.find((o) => o.id === orderId);
      if (!order) return;

      await updateDoc(orderRef, {
        status: newStatus,
      });

      let message = "";
      switch (newStatus) {
        case "preparing":
          message = `Hi ${order.customerName}! Your pizza order is now being prepared.`;
          break;
        case "ready":
          message = `Hi ${order.customerName}! Your pizza is ready for pickup!`;
          break;
        case "completed":
          message = `Hi ${order.customerName}! Thank you for choosing us. Hope you enjoyed your pizza!`;
          break;
      }

      if (message) {
        console.log("Attempting to send SMS:", {
          phoneNumber: order.phoneNumber,
          message: message,
        });

        await sendSMSNotification(order.phoneNumber, message);
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "preparing":
        return "bg-blue-100 text-blue-800";
      case "ready":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatOrderDate = (timestamp: any) => {
    try {
      // Handle Firestore Timestamp
      if (timestamp && typeof timestamp.toDate === "function") {
        return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
      }

      // Handle regular date strings
      if (timestamp) {
        const date = new Date(timestamp);
        if (!isNaN(date.getTime())) {
          return formatDistanceToNow(date, { addSuffix: true });
        }
      }

      return "Invalid date";
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  };

  const translateOrder = (order: Order) => {
    if (!isHebrew) return order;

    return {
      ...order,
      size: translations.he.sizes[order.size.toLowerCase() as keyof typeof translations.he.sizes] || order.size,
      toppings: order.toppings.map(topping => ({
        ...topping,
        name: translations.he.toppingNames[topping.name as keyof typeof translations.he.toppingNames] || topping.name
      })),
      status: translations.he.orderStatus[order.status as keyof typeof translations.he.orderStatus] || order.status
    };
  };

  // Generate a user-friendly order number
  const generateOrderNumber = (timestamp: Date, index: number) => {
    const dateStr = format(timestamp, 'yyMMdd');
    const sequence = String(index + 1).padStart(3, '0');
    return `${dateStr}-${sequence}`;
  };

  const formatPrice = (price: number) => {
    if (isHebrew) {
      return `₪${(price * 3.7).toFixed(2)}`;
    }
    return `$${price.toFixed(2)}`;
  };

  const displayToppings = (translatedOrder: {
    toppings?: { name: string }[];
  }) => {
    if (!translatedOrder.toppings?.length) {
      return isHebrew ? translations.he.dashboard.labels.noToppings : translations.en.dashboard.labels.noToppings;
    }
    return translatedOrder.toppings.map((t) => t.name).join(", ");
  };

  return (
    <ProtectedRoute>
      <div className={`min-h-screen bg-gray-50 ${isHebrew ? 'rtl' : 'ltr'}`}>
        <Navigation 
          title={isHebrew ? translations.he.dashboard.title : translations.en.dashboard.title}
          logoutText={isHebrew ? translations.he.dashboard.logout : translations.en.dashboard.logout}
          isHebrew={isHebrew}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-end mb-6">
            <Button onClick={() => setIsHebrew(!isHebrew)} variant="outline">
              {isHebrew ? 'English' : 'עברית'}
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Tabs defaultValue="orders" className="w-full" dir={isHebrew ? 'rtl' : 'ltr'}>
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="orders">
                  {isHebrew ? 'הזמנות' : 'Orders'}
                </TabsTrigger>
                <TabsTrigger value="trends">
                  {isHebrew ? 'מגמות' : 'Trends'}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="orders">
                {/* Table view for larger screens */}
                <div className="hidden sm:block">
                  <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order
                          </th>
                          <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Size
                          </th>
                          <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Toppings
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time
                          </th>
                          <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order, index) => {
                          const translatedOrder = translateOrder(order);
                          const orderNumber = generateOrderNumber(order.timestamp, index);
                          
                          return (
                            <tr key={order.id}>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                #{orderNumber}
                              </td>
                              <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {translatedOrder.size}
                              </td>
                              <td className="hidden md:table-cell px-6 py-4 text-sm text-gray-900">
                                <div className="max-w-xs truncate">
                                  {displayToppings(translatedOrder)}
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatPrice(order.totalPrice)}
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                  {translatedOrder.status}
                                </span>
                              </td>
                              <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatOrderDate(order.timestamp)}
                              </td>
                              <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {order.customerName}
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex flex-col sm:flex-row gap-2">
                                  {order.status === "pending" && (
                                    <Button
                                      size="sm"
                                      className="w-full sm:w-auto"
                                      onClick={() => updateOrderStatus(order.id, "preparing")}
                                    >
                                      {isHebrew ? translations.he.dashboard.actions.prepare : translations.en.dashboard.actions.prepare}
                                    </Button>
                                  )}
                                  {order.status === "preparing" && (
                                    <Button
                                      size="sm"
                                      className="w-full sm:w-auto"
                                      onClick={() => updateOrderStatus(order.id, "ready")}
                                    >
                                      {isHebrew ? translations.he.dashboard.actions.ready : translations.en.dashboard.actions.ready}
                                    </Button>
                                  )}
                                  {order.status === "ready" && (
                                    <Button
                                      size="sm"
                                      className="w-full sm:w-auto"
                                      onClick={() => updateOrderStatus(order.id, "completed")}
                                    >
                                      {isHebrew ? translations.he.dashboard.actions.complete : translations.en.dashboard.actions.complete}
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile card view */}
                <div className={`sm:hidden space-y-4 ${isHebrew ? 'rtl' : 'ltr'}`}>
                  {orders.map((order, index) => {
                    const translatedOrder = translateOrder(order);
                    const orderNumber = generateOrderNumber(order.timestamp, index);
                    
                    return (
                      <div
                        key={order.id}
                        className="bg-white shadow rounded-lg p-4 space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              #{orderNumber}
                            </span>
                            <p className="text-sm text-gray-500">
                              {formatDistanceToNow(order.timestamp, {
                                addSuffix: true,
                                locale: isHebrew ? he : undefined
                              })}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {translatedOrder.status}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">
                              {isHebrew ? translations.he.dashboard.labels.customer : translations.en.dashboard.labels.customer}:{' '}
                            </span>
                              {order.customerName}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">
                              {isHebrew ? translations.he.dashboard.labels.size : translations.en.dashboard.labels.size}:{' '}
                            </span>
                              {translatedOrder.size}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">
                              {isHebrew ? translations.he.dashboard.labels.total : translations.en.dashboard.labels.total}:{' '}
                            </span>
                              {formatPrice(order.totalPrice)}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">
                              {isHebrew ? translations.he.dashboard.labels.toppings : translations.en.dashboard.labels.toppings}:{' '}
                            </span>
                              <span className="text-gray-600">
                                {displayToppings(translatedOrder)}
                              </span>
                          </p>
                        </div>

                        <div className="pt-2">
                          {order.status === "pending" && (
                            <Button
                              className="w-full"
                              onClick={() => updateOrderStatus(order.id, "preparing")}
                            >
                              {isHebrew ? translations.he.dashboard.actions.prepare : translations.en.dashboard.actions.prepare}
                            </Button>
                          )}
                          {order.status === "preparing" && (
                            <Button
                              className="w-full"
                              onClick={() => updateOrderStatus(order.id, "ready")}
                            >
                              {isHebrew ? translations.he.dashboard.actions.ready : translations.en.dashboard.actions.ready}
                            </Button>
                          )}
                          {order.status === "ready" && (
                            <Button
                              className="w-full"
                              onClick={() => updateOrderStatus(order.id, "completed")}
                            >
                              {isHebrew ? translations.he.dashboard.actions.complete : translations.en.dashboard.actions.complete}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="trends">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {trends.map((trend) => {
                    const translatedName = isHebrew 
                      ? translations.he.toppingNames[trend.toppingName as keyof typeof translations.he.toppingNames] || trend.toppingName
                      : trend.toppingName;
                    
                    return (
                      <div key={trend.toppingName} className="border rounded-lg p-4 shadow-sm">
                        <h2 className="font-bold text-lg mb-2">{translatedName}</h2>
                        <p className="text-sm text-gray-600">
                          {isHebrew ? translations.he.dashboard.trends.popularity : translations.en.dashboard.trends.popularity}: {trend.popularity.toFixed(2)}
                          {' '}
                          {isHebrew ? translations.he.dashboard.trends.requestsPerDay : translations.en.dashboard.trends.requestsPerDay}
                        </p>
                        <p className="text-sm text-gray-600">
                          {isHebrew ? translations.he.dashboard.trends.activeDays : translations.en.dashboard.trends.activeDays}: {trend.timespan.toFixed(0)}
                          {' '}
                          {isHebrew ? translations.he.dashboard.trends.days : translations.en.dashboard.trends.days}
                        </p>
                        <p className="mt-2 text-blue-600 font-medium">
                          {isHebrew ? translations.he.dashboard.trends.recommendation : translations.en.dashboard.trends.recommendation}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
