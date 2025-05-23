"use client";
import { useEffect } from "react";
import { supabase } from "../../../utils/supabaseClient";

const EXTENSION_ID = process.env.NEXT_PUBLIC_EXTENSION_ID;

export default function AuthCallback() {
  useEffect(() => {
    const sendSessionToExtension = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        window.postMessage({
          type: 'STASHED_AUTH',
          session: {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: Date.now() + (session.expires_in * 1000)
          }
        }, `chrome-extension://${EXTENSION_ID}`);
      }
    };

    sendSessionToExtension();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-white dark:bg-zinc-900 shadow-lg rounded-lg p-8 w-full max-w-md border border-zinc-200 dark:border-zinc-800 text-center">
        <h1 className="text-2xl font-bold mb-4 text-green-600 dark:text-green-400">Sign-in Successful!</h1>
        <p className="mb-6 text-zinc-700 dark:text-zinc-200">
          You have been signed in. You can now return to the Stashed extension.
        </p>
        <a
          href="https://chrome.google.com/webstore/category/extensions"
          className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition"
        >
          Go to Extension
        </a>
      </div>
    </div>
  );
} 