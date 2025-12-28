import { storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const UploadFile = async (file) => {
  try {
    if (!file) throw new Error("No file provided");
    const fileName = `uploads/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, fileName);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      url: downloadURL,
      name: file.name,
      type: file.type,
      size: file.size
    };
  } catch (error) {
    console.error("Firebase Upload Error:", error);
    throw error;
  }
};

export const SendEmail = async (data) => {
    console.log("Email sent (simulation):", data);
    return { success: true };
};

export const Core = { UploadFile, SendEmail };
export const InvokeLLM = async () => {};
export const GenerateImage = async () => {};