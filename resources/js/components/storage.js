import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;

if (!SECRET_KEY) {
    console.error('SECRET_KEY is missing');
}

export const encryptAndStore = (key, value) => {
    if (!value) {
        console.error(`encryptAndStore called with invalid value for key: ${key}`, value);
        return;
    }

    const encryptedValue = CryptoJS.AES.encrypt(JSON.stringify(value), SECRET_KEY).toString();
    localStorage.setItem(key, encryptedValue);
};

export const retrieveAndDecrypt = (key) => {
    const encryptedValue = localStorage.getItem(key);
    if (!encryptedValue) return null;

    try {
        const bytes = CryptoJS.AES.decrypt(encryptedValue, SECRET_KEY);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
        console.error('Error decrypting data:', error);
        return null;
    }
};