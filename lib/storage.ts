import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase'

export async function uploadActivityImage(
  uid: string,
  file: File,
): Promise<string> {
  const ext      = file.name.split('.').pop() ?? 'jpg'
  const fileName = `activities/${uid}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
  const storageRef = ref(storage, fileName)
  const snap = await uploadBytes(storageRef, file, {
    contentType: file.type,
  })
  return getDownloadURL(snap.ref)
}
