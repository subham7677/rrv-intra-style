import React, { useState } from 'react';
import { X, Mail, Lock, LogIn, UserPlus, KeyRound, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, signup, forgotPassword } = useAuth();
  const { addToast } = useToast();

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (mode === 'forgot') {
      try {
        setLoading(true);
        await forgotPassword(email);
        addToast('Password reset link sent to your email!', 'success');
        resetForm();
        setMode('login');
      } catch (err) {
        setError(err.message || 'Failed to send password reset email');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      try {
        setLoading(true);
        await signup(email, password);
        addToast('Account created successfully!', 'success');
        resetForm();
        onClose();
      } catch (err) {
        setError(err.message || 'Failed to create account');
      } finally {
        setLoading(false);
      }
    } else if (mode === 'login') {
      try {
        setLoading(true);
        await login(email, password);
        addToast('Welcome back! Logged in successfully.', 'success');
        resetForm();
        onClose();
      } catch (err) {
        setError(err.message || 'Invalid email or password');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="modal-auth-dialog animate-scale-up" onClick={(e) => e.stopPropagation()}>
        {/* CLOSE BUTTON */}
        <button className="modal-close-btn auth-close-pos" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        {/* HEADER */}
        <div className="auth-header">
          <div className="auth-icon-circle">
            {mode === 'login' && <LogIn size={26} />}
            {mode === 'signup' && <UserPlus size={26} />}
            {mode === 'forgot' && <KeyRound size={26} />}
          </div>
          <h3 className="auth-title">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'signup' && 'Create an Account'}
            {mode === 'forgot' && 'Reset Password'}
          </h3>
          <p className="auth-subtitle">
            {mode === 'login' && 'Login to access your cart, order history & WhatsApp checkout'}
            {mode === 'signup' && 'Join RRV INTRA STYLE for personalized photo gifts'}
            {mode === 'forgot' && 'Enter your email to receive a password reset link'}
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error-banner">{error}</div>}

          {/* EMAIL */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-icon-wrapper">
              <Mail size={18} className="field-icon" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
              />
            </div>
          </div>

          {/* PASSWORD (IF NOT FORGOT) */}
          {mode !== 'forgot' && (
            <div className="form-group">
              <div className="label-row">
                <label className="form-label">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    className="link-btn-text"
                    onClick={() => handleModeChange('forgot')}
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="input-icon-wrapper">
                <Lock size={18} className="field-icon" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
            </div>
          )}

          {/* CONFIRM PASSWORD (IF SIGNUP) */}
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-icon-wrapper">
                <Lock size={18} className="field-icon" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? (
              <Loader2 size={18} className="spin" />
            ) : mode === 'login' ? (
              'Login'
            ) : mode === 'signup' ? (
              'Create Account'
            ) : (
              'Send Reset Email'
            )}
          </button>
        </form>

        {/* SWITCH MODES */}
        <div className="auth-switch-footer">
          {mode === 'login' && (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                className="link-highlight"
                onClick={() => handleModeChange('signup')}
              >
                Sign Up
              </button>
            </p>
          )}

          {mode === 'signup' && (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                className="link-highlight"
                onClick={() => handleModeChange('login')}
              >
                Login
              </button>
            </p>
          )}

          {mode === 'forgot' && (
            <p>
              Remembered your password?{' '}
              <button
                type="button"
                className="link-highlight"
                onClick={() => handleModeChange('login')}
              >
                Back to Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
