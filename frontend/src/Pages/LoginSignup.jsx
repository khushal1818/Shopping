import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import './CSS/LoginSignup.css';

const EyeIcon = ({ visible }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {visible ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

const LoginSignup = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'Sign Up' : 'Login';
  const [state, setState] = useState(initialMode); // 'Login' or 'Sign Up'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agree: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect
  useEffect(() => {
    if (user && !successMessage) {
      const redirectPath = location.state?.from || searchParams.get('redirect') || '/';
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate, location, searchParams, successMessage]);

  // Sync mode if query param changes
  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'signup') {
      setState('Sign Up');
    } else if (modeParam === 'login') {
      setState('Login');
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear specific field error on typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const validate = () => {
    const newErrors = {};

    if (state === 'Sign Up') {
      if (!formData.name.trim()) {
        newErrors.name = 'Full name is required.';
      } else if (formData.name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters.';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (state === 'Sign Up') {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password.';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match.';
      }

      if (!formData.agree) {
        newErrors.agree = 'You must agree to the terms of use & privacy policy.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (state === 'Login') {
        const res = await login({
          email: formData.email,
          password: formData.password,
        });
        setSuccessMessage(res.message || 'Login successful! Welcome back.');
      } else {
        const res = await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        });
        setSuccessMessage(res.message || 'Registration successful! Welcome to Vistora.');
      }

      // Smooth redirection to destination
      setTimeout(() => {
        const redirectPath = location.state?.from || searchParams.get('redirect') || '/';
        navigate(redirectPath, { replace: true });
      }, 900);
    } catch (err) {
      setServerError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (newMode) => {
    setState(newMode);
    setErrors({});
    setServerError('');
    setSuccessMessage('');
  };

  return (
    <div className='loginsignup'>
      <div className="loginsignup-container">
        <h1>{state}</h1>

        {successMessage && (
          <div className="loginsignup-alert success" role="alert">
            <span className="alert-icon">✓</span>
            <span>{successMessage}</span>
          </div>
        )}

        {serverError && (
          <div className="loginsignup-alert error" role="alert">
            <span className="alert-icon">⚠️</span>
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="loginsignup-fields">
            {state === 'Sign Up' && (
              <div className="input-group">
                <input
                  type='text'
                  name='name'
                  id='name-input'
                  value={formData.name}
                  onChange={handleChange}
                  placeholder='Your Name'
                  disabled={isSubmitting}
                  className={errors.name ? 'input-error' : ''}
                  autoComplete="name"
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>
            )}

            <div className="input-group">
              <input
                type="email"
                name='email'
                id='email-input'
                value={formData.email}
                onChange={handleChange}
                placeholder='Email Address'
                disabled={isSubmitting}
                className={errors.email ? 'input-error' : ''}
                autoComplete="email"
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="input-group password-group">
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  id='password-input'
                  value={formData.password}
                  onChange={handleChange}
                  placeholder='Password'
                  disabled={isSubmitting}
                  className={errors.password ? 'input-error' : ''}
                  autoComplete={state === 'Login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            {state === 'Sign Up' && (
              <div className="input-group password-group">
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name='confirmPassword'
                    id='confirm-password-input'
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder='Confirm Password'
                    disabled={isSubmitting}
                    className={errors.confirmPassword ? 'input-error' : ''}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    tabIndex={-1}
                  >
                    <EyeIcon visible={showConfirmPassword} />
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="field-error">{errors.confirmPassword}</span>
                )}
              </div>
            )}
          </div>

          {state === 'Sign Up' && (
            <div className="loginsignup-agree">
              <input
                type="checkbox"
                name='agree'
                id='agree-checkbox'
                checked={formData.agree}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <label htmlFor="agree-checkbox">
                By continuing, I agree to the terms of use & privacy policy.
              </label>
            </div>
          )}
          {errors.agree && <span className="field-error agree-error">{errors.agree}</span>}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
          >
            {isSubmitting ? (
              <span className="btn-spinner-wrapper">
                <span className="spinner"></span>
                <span>{state === 'Login' ? 'Logging in...' : 'Registering...'}</span>
              </span>
            ) : (
              state === 'Login' ? 'Login' : 'Continue'
            )}
          </button>
        </form>

        {state === 'Sign Up' ? (
          <p className="loginsignup-login">
            Already have an account? <span onClick={() => switchMode('Login')}>Login here</span>
          </p>
        ) : (
          <p className="loginsignup-login">
            Don't have an account? <span onClick={() => switchMode('Sign Up')}>Click here</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginSignup;