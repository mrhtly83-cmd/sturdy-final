"use client"; // This is required for Next.js 13+ functionality

import { useState } from "react";
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  OAuthProvider, 
  signInWithEmailAndPassword 
} from "firebase/auth";

// --- PASTE YOUR FIREBASE CONFIG HERE ---
const firebaseConfig = {
  // ... your keys from the Firebase Console ...
};

// Initialize Firebase (only if it hasn't been done already)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // --- GOOGLE LOGIN ---
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      alert("Logged in with Google!");
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : String(error));
    }
  };

  // --- APPLE LOGIN ---
  const handleAppleLogin = async () => {
    const provider = new OAuthProvider("apple.com");
    try {
      await signInWithPopup(auth, provider);
      alert("Logged in with Apple!");
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : String(error));
    }
  };

  // --- EMAIL LOGIN ---
  const handleEmailLogin = async (e) => {
    e.preventDefault(); // Stop the form from refreshing the page
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Logged in with Email!");
    } catch (error) {
      alert(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">Sign In</h1>

        {/* Email Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded border p-2 text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded border p-2 text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700">
            Sign In with Email
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="h-px flex-grow bg-gray-300"></div>
          <span className="px-3 text-gray-500">OR</span>
          <div className="h-px flex-grow bg-gray-300"></div>
        </div>

        {/* Social Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            className="w-full rounded border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50"
          >
            Sign in with Google
          </button>

          {/* APPLE BUTTON - TEMPORARILY DISABLED
          <button
            onClick={handleAppleLogin}
            className="w-full rounded bg-black p-2 text-white hover:bg-gray-800"
          >
            Sign in with Apple
          </button>
          */}
        </div>
      </div>
    </div>
  );
}