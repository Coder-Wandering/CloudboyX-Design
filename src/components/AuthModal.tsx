import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Shield,
  Key,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup' | 'admin';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'signup',
  onSuccess,
}) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, unlockDemoAccess } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'admin'>(defaultMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const isDark =
    typeof document !== 'undefined' &&
    (document.documentElement.classList.contains('dark') ||
      document.documentElement.getAttribute('data-theme') === 'dark' ||
      document.documentElement.getAttribute('data-bs-theme') === 'dark');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!email || !password) {
          throw new Error('Please fill in all required fields.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        await signUpWithEmail(email, password, name);
      } else if (mode === 'admin') {
        if (!email || !password) {
          throw new Error('Please enter administrator email and password.');
        }
        await signInWithEmail(email, password);
      } else {
        if (!email || !password) {
          throw new Error('Please enter your email and password.');
        }
        await signInWithEmail(email, password);
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || 'Authentication failed. Please try again.';
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        msg = 'Invalid credentials. If this is your first admin login, you can also use Quick Admin Pass.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Try signing in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please allow popups or use Email & Password.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled. Please try again.');
      } else {
        setError(err.message || 'Google sign-in could not be completed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdminQuickPass = () => {
    unlockDemoAccess(true);
    onSuccess?.();
    onClose();
  };

  const handleGuestQuickPass = () => {
    unlockDemoAccess(false);
    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden transition-colors ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-slate-200/80 text-slate-900'
        }`}
        id="auth-modal"
      >
        {/* Header decoration bar */}
        <div
          className={`h-1.5 transition-colors ${
            mode === 'admin'
              ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600'
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500'
          }`}
        />

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition ${
            isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-800'
              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 md:p-8 space-y-6">
          {/* Logo & Title */}
          <div className="text-center space-y-1.5">
            <div
              className={`inline-flex items-center justify-center w-11 h-11 rounded-xl text-white shadow-md mb-2 transition ${
                mode === 'admin'
                  ? 'bg-violet-600 shadow-violet-500/20'
                  : 'bg-blue-600 shadow-blue-500/20'
              }`}
            >
              {mode === 'admin' ? <Shield className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {mode === 'admin'
                ? 'Administrator Login'
                : mode === 'signup'
                ? 'Create Your Account'
                : 'Welcome Back'}
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {mode === 'admin'
                ? 'Sign in to access the platform admin dashboard and gate controls'
                : mode === 'signup'
                ? 'Sign up to unlock the visual Bootstrap 5 website builder'
                : 'Sign in to access your saved websites and visual builder'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className={`flex p-1 rounded-xl gap-0.5 ${isDark ? 'bg-slate-950 border border-slate-800' : 'bg-slate-100'}`}>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                mode === 'signup'
                  ? isDark
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-white text-slate-900 shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                mode === 'signin'
                  ? isDark
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-white text-slate-900 shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('admin');
                setEmail('david@cloudboyx.io');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1 ${
                mode === 'admin'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:text-violet-400'
                  : 'text-slate-500 hover:text-violet-700'
              }`}
            >
              <Key className="w-3 h-3" />
              <span>Admin</span>
            </button>
          </div>

          {/* Admin Banner */}
          {mode === 'admin' && (
            <div className={`p-3 border rounded-xl text-xs space-y-1 ${
              isDark
                ? 'bg-violet-950/40 border-violet-800/80 text-violet-200'
                : 'bg-violet-50 border-violet-200/80 text-violet-800'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span>Primary Admin: david@cloudboyx.io</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isDark ? 'bg-violet-900 text-violet-200' : 'bg-violet-200'}`}>RBAC</span>
              </div>
              <p className={`text-[11px] ${isDark ? 'text-violet-300' : 'text-violet-600'}`}>
                Grants access to gate controls, user roles directory, and global announcements.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className={`p-3 border rounded-xl flex items-start gap-2.5 text-xs ${
              isDark
                ? 'bg-red-950/50 border-red-800 text-red-300'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-in Button (Shown on user modes) */}
          {mode !== 'admin' && (
            <div>
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className={`w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl text-xs font-semibold shadow-xs transition active:scale-[0.99] disabled:opacity-50 border ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
                    : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center my-4">
                <div className={`border-t w-full ${isDark ? 'border-slate-800' : 'border-slate-200'}`} />
                <span className={`px-3 text-[11px] font-semibold uppercase tracking-wider absolute ${
                  isDark ? 'bg-slate-900 text-slate-500' : 'bg-white text-slate-400'
                }`}>
                  Or with email
                </span>
              </div>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl transition focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 border ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:bg-slate-950'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'
                    }`}
                  />
                </div>
              </div>
            )}

            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {mode === 'admin' ? 'Administrator Email' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="david@cloudboyx.io"
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl transition font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 border ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:bg-slate-950'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl transition focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 border ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:bg-slate-950'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'
                  }`}
                />
              </div>
              {mode === 'signup' && (
                <span className={`text-[10px] mt-1 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Must be at least 6 characters
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 px-4 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center justify-center gap-1.5 active:scale-[0.99] disabled:opacity-50 ${
                mode === 'admin'
                  ? 'bg-violet-600 hover:bg-violet-700 shadow-violet-500/20'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'admin'
                      ? 'Sign In to Admin Portal'
                      : mode === 'signup'
                      ? 'Create Free Account'
                      : 'Sign In'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Sandbox / Instant Passes */}
          <div className={`pt-3 border-t flex flex-col gap-2 text-center ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            {mode === 'admin' ? (
              <button
                type="button"
                onClick={handleAdminQuickPass}
                className={`text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition p-2 rounded-xl border ${
                  isDark
                    ? 'text-violet-400 hover:text-violet-300 bg-violet-950/40 border-violet-900'
                    : 'text-violet-600 hover:text-violet-700 bg-violet-50 border-violet-200/60'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>One-Click Admin Pass (david@cloudboyx.io)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGuestQuickPass}
                className={`text-xs font-medium inline-flex items-center justify-center gap-1 transition ${
                  isDark
                    ? 'text-slate-400 hover:text-cyan-400'
                    : 'text-slate-500 hover:text-blue-600'
                }`}
              >
                <ShieldCheck className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-blue-500'}`} />
                <span>Or explore builder with Instant Preview Pass</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
