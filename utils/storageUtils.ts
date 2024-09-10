import CryptoJS from "crypto-js";

const SECRET_KEY = "0c5473b2958e26dc196ef5fda0e102b7"; // Change this to a strong, random secret key

/**
 * Encrypts a value and stores it in localStorage.
 * @param key - The key for localStorage.
 * @param value - The value to encrypt and store.
 */
export function setEncryptedItem(key: string, value: unknown): void {
  try {
    const stringValue =
      typeof value === "string" ? value : JSON.stringify(value);
    const encryptedValue = CryptoJS.AES.encrypt(
      stringValue,
      SECRET_KEY,
    ).toString();
    localStorage.setItem(key, encryptedValue);
  } catch (error) {
    console.error("Error in setEncryptedItem:", error);
    throw error;
  }
}

/**
 * Retrieves and decrypts a value from localStorage.
 * @param key - The key for localStorage.
 * @returns The decrypted value or null if not found.
 */
export function getDecryptedItem(key: string): string | null {
  const encryptedValue = localStorage.getItem(key);
  if (!encryptedValue) return null;

  try {
    const bytes = CryptoJS.AES.decrypt(encryptedValue, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
}

/**
 * Removes an item from localStorage.
 * @param key - The key for localStorage.
 */
export function removeItem(key: string): void {
  localStorage.removeItem(key);
}
