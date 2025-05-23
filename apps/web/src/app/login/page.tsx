"use client";
import { useState } from "react";
import { supabase } from "../../utils/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your email for the magic link!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form
        onSubmit={handleLogin}
        className="bg-white dark:bg-zinc-900 shadow-lg rounded-lg p-8 w-full max-w-md border border-zinc-200 dark:border-zinc-800"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Sign in to Stashed</h1>
        <label className="block mb-4">
          <span className="block text-sm font-medium mb-2">Email address</span>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Magic Link"}
        </button>
        {message && (
          <p className="mt-4 text-center text-sm text-blue-600 dark:text-blue-400">{message}</p>
        )}
      </form>
    </div>
  );
} 