import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";

export const Order = {
  create: async (orderData) => {
    try {
      const finalOrder = {
        ...orderData,
        created_date: new Date().toISOString(),
        status: 'new',
        items: orderData.items || [] // מוודא שיש פריטים
      };
      const docRef = await addDoc(collection(db, "orders"), finalOrder);
      return { id: docRef.id, ...finalOrder };
    } catch (e) {
      console.error("Error creating order: ", e);
      throw e;
    }
  },
  list: async () => {
    try {
      const q = query(collection(db, "orders"), orderBy("created_date", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error(e); return [];
    }
  }
};

export const Coupon = {
  filter: async () => [], // כרגע אין קופונים פעילים
  create: async (data) => await addDoc(collection(db, "coupons"), data),
  list: async () => []
};

export const User = {
  login: async () => ({ id: "admin", email: "admin@test.com" }),
  current: async () => null
};