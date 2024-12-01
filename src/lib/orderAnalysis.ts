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

export async function trackUnavailableToppingRequest(toppingName: string) {
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
    console.error("Error tracking topping request:", error);
  }
}

export async function analyzeTrends(): Promise<TrendAnalysis[]> {
  try {
    const requestsRef = collection(db, "toppingRequests");
    const querySnapshot = await getDocs(requestsRef);
    const trends: TrendAnalysis[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as ToppingRequest;
      const timespan = new Date().getTime() - data.firstRequested.getTime();
      const daysActive = timespan / (1000 * 60 * 60 * 24);
      const requestsPerDay = data.count / daysActive;

      let recommendation = "";
      if (requestsPerDay >= 0.5 && data.count >= 15) {
        recommendation = "Highly recommended to add to menu";
      } else if (requestsPerDay >= 0.2 && data.count >= 8) {
        recommendation = "Consider adding to menu";
      } else {
        recommendation = "Monitor demand";
      }

      trends.push({
        toppingName: data.toppingName,
        popularity: requestsPerDay,
        timespan: daysActive,
        recommendation
      });
    });

    return trends;
  } catch (error) {
    console.error("Error analyzing trends:", error);
    throw error;
  }
} 