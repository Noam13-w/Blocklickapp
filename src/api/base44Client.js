// src/api/base44Client.js
import { User } from './entities';

// יצירת אובייקט דמי שמחקה את המערכת הישנה
// אבל מפנה את הבקשות לקוד החדש שלך
export const base44 = {
  auth: {
    // כשמנסים לבדוק מי המשתמש, נפנה ללוגיקה החדשה שלנו
    current: async () => {
        return await User.current();
    },
    login: async (email, password) => {
        return await User.login(email, password);
    },
    logout: async () => {
        console.log("Logged out");
        return true;
    }
  },
  // אם יש קריאות ישירות לישויות דרך הקליינט
  entities: {
      Order: {},
      Coupon: {}
  },
  integrations: {
      Core: {
          UploadFile: async () => console.log("Old upload called"),
          InvokeLLM: async () => console.log("LLM not supported"),
      }
  }
};