import { db } from "@/firebase/config";
import { collection, addDoc, query, where, getDocs, updateDoc } from "firebase/firestore";

interface ToppingRequest {
  toppingName: string;
  count: number;
  firstRequested: Date;
  lastRequested: Date;
}

interface TrendAnalysis {
  toppingName: string;
  popularity: number;
  timespan: number;
  recommendation: string;
}

export const trackAIOrder = async (order: {
  toppings: string[];
  size: string;
  placement: string;
}) => {
  try {
    const analyticsRef = collection(db, 'analytics');
    await addDoc(analyticsRef, {
      type: 'ai_order',
      ...order,
      timestamp: new Date()
    });
    console.log('Tracked AI order:', order);
  } catch (error) {
    console.log('Analytics tracking failed:', error);
  }
};

export const trackUnavailableToppingRequest = async (toppingName: string) => {
  try {
    const requestsRef = collection(db, "toppingRequests");
    const q = query(requestsRef, where("toppingName", "==", toppingName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      await addDoc(requestsRef, {
        toppingName,
        count: 1,
        firstRequested: new Date(),
        lastRequested: new Date()
      });
    } else {
      const doc = querySnapshot.docs[0];
      await updateDoc(doc.ref, {
        count: doc.data().count + 1,
        lastRequested: new Date()
      });
    }
  } catch (error) {
    console.log('Analytics tracking failed:', error);
  }
};

export const analyzeTrends = async () => {
  try {
    const requestsRef = collection(db, "toppingRequests");
    const querySnapshot = await getDocs(requestsRef);
    
    const trendsData = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        toppingName: data.toppingName,
        count: data.count,
        // Convert Firestore timestamps to Date objects
        firstRequested: data.firstRequested?.toDate() || new Date(),
        lastRequested: data.lastRequested?.toDate() || new Date()
      };
    });

    // Rest of your analysis logic...
    return trendsData.map(data => ({
      toppingName: data.toppingName,
      popularity: data.count / ((new Date().getTime() - data.firstRequested.getTime()) / (1000 * 60 * 60 * 24)),
      timespan: (data.lastRequested.getTime() - data.firstRequested.getTime()) / (1000 * 60 * 60 * 24),
      recommendation: "Consider adding to menu"
    }));
  } catch (error) {
    console.error("Error in analyzeTrends:", error);
    return [];
  }
};

export const trackToppingUsage = async (toppingName: string, placement: string) => {
  try {
    const toppingStatsRef = collection(db, "toppingStats");
    const q = query(toppingStatsRef, where("toppingName", "==", toppingName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      await addDoc(toppingStatsRef, {
        toppingName,
        totalUses: 1,
        placements: {
          full: placement === 'full' ? 1 : 0,
          left: placement === 'left' ? 1 : 0,
          right: placement === 'right' ? 1 : 0
        },
        firstUsed: new Date(),
        lastUsed: new Date()
      });
    } else {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      await updateDoc(doc.ref, {
        totalUses: data.totalUses + 1,
        placements: {
          full: data.placements.full + (placement === 'full' ? 1 : 0),
          left: data.placements.left + (placement === 'left' ? 1 : 0),
          right: data.placements.right + (placement === 'right' ? 1 : 0)
        },
        lastUsed: new Date()
      });
    }
  } catch (error) {
    console.log('Analytics tracking failed:', error);
  }
}; 