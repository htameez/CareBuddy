import * as Crypto from "expo-crypto";
import { encode as base64encode } from "base64-arraybuffer";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ Function to generate a secure `code_verifier` (43–128 characters)
const generateCodeVerifier = async () => {
    const randomBytes = Crypto.getRandomBytes(32); // Generates 32 random bytes
    const codeVerifier = base64encode(randomBytes)  // Convert to Base64
        .replace(/[^a-zA-Z0-9-_]/g, "") // Make it URL-safe
        .substring(0, 128); // Ensure it's within RFC limits

    return codeVerifier;
};

// ✅ Function to generate `code_challenge` from `code_verifier`
const generateCodeChallenge = async (codeVerifier: string) => {
    const hashed = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        codeVerifier,
        { encoding: Crypto.CryptoEncoding.BASE64 }
    );

    return hashed.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); // Ensure Base64-URL encoding
};

// ✅ Generate & Store PKCE Credentials
export const setupPKCE = async () => {
    const codeVerifier = await generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    console.log("✅ Generated Code Verifier:", codeVerifier);
    console.log("✅ Generated Code Challenge:", codeChallenge);

    await AsyncStorage.setItem("code_verifier", codeVerifier);

    return { codeVerifier, codeChallenge };
};