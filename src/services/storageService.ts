import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function uploadImage(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function uploadOfferImage(businessId: string, file: File): Promise<string> {
  const path = `offers/${businessId}/${Date.now()}_${file.name}`;
  return uploadImage(file, path);
}
