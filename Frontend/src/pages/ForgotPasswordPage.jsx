import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-stone-200 space-y-4">
        <h1 className="text-xl font-bold text-stone-900">Reset Password</h1>
        {submitted ? (
          <p className="text-sm text-emerald-700 bg-emerald-50 p-3 rounded-lg">
            If an account exists for <strong>{email}</strong>, reset instructions have been queued. You can also update your password anytime from your Profile page when signed in.
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="space-y-4"
          >
            <input
              type="email"
              required
              placeholder="Enter registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm text-stone-900"
            />
            <button className="w-full py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold">
              Send Reset Link
            </button>
          </form>
        )}
        <Link to="/login" className="block text-center text-xs text-emerald-600 hover:underline">
          Back to Login
        </Link>
      </div>
    </div>
  );
}