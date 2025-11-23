import React, { useState } from 'react';
import { LogIn, UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import { authService } from '../services/auth';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        await authService.signUp(email, password);
        setSuccessMessage('Account created! Please check your email to verify your account, then sign in.');
        setIsSignUp(false);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        await authService.signIn(email, password);
        onAuthSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-primary-900 rounded-3xl items-center justify-center text-white font-display font-bold text-3xl mb-4 shadow-lg shadow-primary-900/20">
            U
          </div>
          <h1 className="text-4xl font-display font-bold text-primary-900 mb-2">UniTrack Pro</h1>
          <p className="text-primary-500">Your Academic Task Manager</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-primary-100 p-8">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setIsSignUp(false);
                setError('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                !isSignUp
                  ? 'bg-primary-900 text-white shadow-lg shadow-primary-900/20'
                  : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsSignUp(true);
                setError('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                isSignUp
                  ? 'bg-primary-900 text-white shadow-lg shadow-primary-900/20'
                  : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800">{successMessage}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-primary-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="w-full bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 text-sm focus:border-primary-900 focus:bg-white outline-none transition-colors"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 text-sm focus:border-primary-900 focus:bg-white outline-none transition-colors"
                disabled={loading}
              />
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-semibold text-primary-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 text-sm focus:border-primary-900 focus:bg-white outline-none transition-colors"
                  disabled={loading}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-900 text-white py-3 rounded-xl font-medium hover:bg-black transition-all shadow-lg shadow-primary-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  {isSignUp ? (
                    <>
                      <UserPlus className="w-5 h-5" />
                      <span>Create Account</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      <span>Sign In</span>
                    </>
                  )}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-primary-100">
            <p className="text-xs text-center text-primary-500">
              {isSignUp ? (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setIsSignUp(false);
                      setError('');
                      setSuccessMessage('');
                    }}
                    className="text-primary-900 font-semibold hover:underline"
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button
                    onClick={() => {
                      setIsSignUp(true);
                      setError('');
                      setSuccessMessage('');
                    }}
                    className="text-primary-900 font-semibold hover:underline"
                  >
                    Sign up
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="mt-6 bg-white/80 backdrop-blur rounded-2xl border border-primary-100 p-4">
          <p className="text-xs text-primary-600 text-center">
            <strong>Note:</strong> Requires Supabase backend with authentication enabled and tasks table configured.
          </p>
        </div>
      </div>
    </div>
  );
};
