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
import { formatDistanceToNow } from "date-fns";

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

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orderData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];

      setOrders(orderData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
            Orders Dashboard
          </h1>

          {isLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              {/* Table view for larger screens */}
              <div className="hidden sm:block">
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
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
                        {orders.map((order) => (
                          <tr key={order.id}>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {order.id.slice(0, 4)}...
                            </td>
                            <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {order.size}
                            </td>
                            <td className="hidden md:table-cell px-6 py-4 text-sm text-gray-900">
                              <div className="max-w-xs truncate">
                                {order.toppings.map((t) => t.name).join(", ")}
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${order.totalPrice}
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                  order.status
                                )}`}
                              >
                                {order.status}
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
                                    Prepare
                                  </Button>
                                )}
                                {order.status === "preparing" && (
                                  <Button
                                    size="sm"
                                    className="w-full sm:w-auto"
                                    onClick={() => updateOrderStatus(order.id, "ready")}
                                  >
                                    Ready
                                  </Button>
                                )}
                                {order.status === "ready" && (
                                  <Button
                                    size="sm"
                                    className="w-full sm:w-auto"
                                    onClick={() => updateOrderStatus(order.id, "completed")}
                                  >
                                    Complete
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Card view for mobile */}
              <div className="sm:hidden space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white shadow rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          Order #{order.id.slice(0, 4)}
                        </span>
                        <p className="text-sm text-gray-500">
                          {formatOrderDate(order.timestamp)}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Customer: </span>
                        {order.customerName}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Size: </span>
                        {order.size}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Total: </span>
                        ${order.totalPrice}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Toppings: </span>
                        <span className="text-gray-600">
                          {order.toppings.map((t) => t.name).join(", ")}
                        </span>
                      </p>
                    </div>

                    <div className="pt-2">
                      {order.status === "pending" && (
                        <Button
                          className="w-full"
                          onClick={() => updateOrderStatus(order.id, "preparing")}
                        >
                          Start Preparing
                        </Button>
                      )}
                      {order.status === "preparing" && (
                        <Button
                          className="w-full"
                          onClick={() => updateOrderStatus(order.id, "ready")}
                        >
                          Mark as Ready
                        </Button>
                      )}
                      {order.status === "ready" && (
                        <Button
                          className="w-full"
                          onClick={() => updateOrderStatus(order.id, "completed")}
                        >
                          Complete Order
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
