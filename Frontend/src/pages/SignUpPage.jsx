import React from 'react'
import { useState } from 'react'
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Gicon from '../assets/Gicon.svg'
import Blogo from '../assets/BrandLogo.svg'
import "../styles/main.scss"
import 'bootstrap-icons/font/bootstrap-icons.css';

const SignUpPage = () => {
  const [message, setMessage] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);

  const { signUpUser, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const watchPassword = watch("password", "");
  const watchConfirmPassword = watch("confirmPassword", "");

  const passwordsMatch = watchPassword && watchConfirmPassword && watchPassword === watchConfirmPassword;
  const passwordsDontMatch = watchPassword && watchConfirmPassword && watchPassword !== watchConfirmPassword;

  const checkPasswordStrength = (password) => {
    let strength = 0;
    const requirements = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    if (requirements.length) strength++;
    if (requirements.lowercase) strength++;
    if (requirements.uppercase) strength++;
    if (requirements.number) strength++;
    if (requirements.special) strength++;

    return {
      strength,
      requirements,
      score: (strength / 5) * 100
    };
  };

  const getStrengthColor = (score) => {
    if (score < 40) return 'danger';
    if (score < 70) return 'warning';
    return 'success';
  };

  const getStrengthText = (score) => {
    if (score < 40) return 'Weak';
    if (score < 70) return 'Medium';
    return 'Strong';
  };

  const passwordStrength = checkPasswordStrength(watchPassword);

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      setMessage("Passwords do not match. Please check and try again.");
      return;
    }

    try {
      setEmailLoading(true);
      setMessage("");
      await signUpUser(data.email, data.password, data.username);
      navigate("/");
    } catch (error) {
      console.error("Sign up error:", error.code);
      if (error.code === "auth/email-already-in-use")
        setMessage("An account with this email already exists. Please log in.");
      else if (error.code === "auth/invalid-email")
        setMessage("Invalid email format.");
      else if (error.code === "auth/weak-password")
        setMessage("Password is too weak. Please choose a stronger password.");
      else if (error.code === "auth/operation-not-allowed")
        setMessage("Sign up is currently disabled. Please try again later.");
      else 
        setMessage("Failed to create account. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setGoogleLoading(true);
      await signInWithGoogle();
      navigate("/");
    } catch (error) {
      console.error("Google Sign-up error:", error);
      if (error.code === "auth/account-exists-with-different-credential") {
        setMessage("An account already exists with this email. Please log in instead.");
      } else {
        setMessage("Google sign-up failed! Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="split-container">
      {/* LEFT SECTION - Stays on left for desktop, goes to bottom for mobile */}
      <div className="left background-secondary">
        <div className="login-form-container">
          <div className="welcome-header text-center mb-4">
            <h3 className="font-family-serif fw-bold mb-2">Welcome</h3>
            <p className="font-family-sans-serif text-secondary fs-6">Create your ebookstore account</p>
          </div>

          {message && (
            <div className="alert alert-danger text-center p-2">{message}</div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label className="form-label label-text font-family-sans-serif">Username</label>
              <input 
                type="text" 
                className="form-control font-family-sans-serif input-text text-secondary fw-lighter" 
                placeholder="Your username"
                {...register("username", { 
                  required: "Username is required",
                  minLength: {
                    value: 2,
                    message: "Username must be at least 2 characters"
                  }
                })}
              />
              {errors.username && (
                <small className="text-danger">{errors.username.message}</small>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label label-text font-family-sans-serif">Email address</label>
              <input 
                type="email" 
                className="form-control font-family-sans-serif input-text text-secondary fw-lighter" 
                placeholder="Your@email.com"
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email format"
                  }
                })}
              />
              {errors.email && (
                <small className="text-danger">{errors.email.message}</small>
              )}
            </div>

            {/* Password Field */}
            <div className="mb-3">
              <label className="form-label label-text font-family-sans-serif">Password</label>
              <div className="position-relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="form-control font-family-sans-serif fw-lighter pe-5" 
                  placeholder="Password"
                  {...register("password", { 
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters"
                    }
                  })}
                  onFocus={() => setShowPasswordStrength(true)}
                  onBlur={() => setShowPasswordStrength(false)}
                />
                <i
                  className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} password-eye-icon`}
                  onClick={() => setShowPassword(!showPassword)}
                ></i>
              </div>
              {errors.password && (
                <small className="text-danger">{errors.password.message}</small>
              )}
            </div>

            {/* Password Strength Indicator */}
            {showPasswordStrength && (
              <div className="mb-3 p-3 border rounded bg-light password-strength-container">
                <div className="mb-2">
                  <strong>Password Strength:</strong>
                  <span className={`text-${getStrengthColor(passwordStrength.score)} ms-2`}>
                    {getStrengthText(passwordStrength.score)}
                  </span>
                </div>
                
                <div className="progress mb-3" style={{ height: '8px' }}>
                  <div 
                    className={`progress-bar bg-${getStrengthColor(passwordStrength.score)}`}
                    style={{ width: `${passwordStrength.score}%` }}
                  ></div>
                </div>

                <div className="small">
                  <div className={`mb-1 ${passwordStrength.requirements.length ? 'text-success' : 'text-danger'}`}>
                    {passwordStrength.requirements.length ? '✓' : '✗'} At least 8 characters
                  </div>
                  <div className={`mb-1 ${passwordStrength.requirements.lowercase ? 'text-success' : 'text-danger'}`}>
                    {passwordStrength.requirements.lowercase ? '✓' : '✗'} Lowercase letter (a-z)
                  </div>
                  <div className={`mb-1 ${passwordStrength.requirements.uppercase ? 'text-success' : 'text-danger'}`}>
                    {passwordStrength.requirements.uppercase ? '✓' : '✗'} Uppercase letter (A-Z)
                  </div>
                  <div className={`mb-1 ${passwordStrength.requirements.number ? 'text-success' : 'text-danger'}`}>
                    {passwordStrength.requirements.number ? '✓' : '✗'} Number (0-9)
                  </div>
                  <div className={`mb-1 ${passwordStrength.requirements.special ? 'text-success' : 'text-danger'}`}>
                    {passwordStrength.requirements.special ? '✓' : '✗'} Special character (!@#$...)
                  </div>
                </div>
              </div>
            )}

            {/* Confirm Password Field */}
            <div className="mb-4">
              <label className="form-label label-text font-family-sans-serif">Confirm Password</label>
              <div className="position-relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  className={`form-control font-family-sans-serif fw-lighter pe-5 ${
                    passwordsMatch ? 'border-success' : passwordsDontMatch ? 'border-danger' : ''
                  }`}
                  placeholder="Confirm your password"
                  {...register("confirmPassword", { 
                    required: "Please confirm your password",
                    validate: value => 
                      value === watchPassword || "Passwords do not match"
                  })}
                />
                <i
                  className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"} password-eye-icon`}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                ></i>
              </div>
              
              {passwordsMatch && (
                <div className="password-match-success mt-1">
                  <i className="bi bi-check-circle-fill me-1"></i>
                  Passwords match!
                </div>
              )}
              
              {errors.confirmPassword && (
                <small className="password-match-error d-block mt-1">
                  <i className="bi bi-exclamation-circle-fill me-1"></i>
                  {errors.confirmPassword.message}
                </small>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 mb-3"
              disabled={emailLoading || googleLoading}
            >
              {emailLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Creating Account...
                </>
              ) : (
                "Sign Up"
              )}
            </button>

            <button
              type="button"
              className="btn btn-outline-primary w-100 mb-4"
              onClick={handleGoogleSignUp}
              disabled={googleLoading || emailLoading}
            >
              {googleLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Signing Up with Google...
                </>
              ) : (
                <>
                  <img
                    src={Gicon}
                    alt="googleicon"
                    className="me-2"
                    width="16"
                    height="16"
                  />
                  Sign Up with Google
                </>
              )}
            </button>

            <div className='text-center extra-text'>
              <p>Already have an account? <a href="/login" className='text-primary'>Sign In</a></p>
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT SECTION - Stays on right for desktop, goes to top for mobile */}
      <div className="right img-container p-8">
        <div className='brand-container text-center'>
          <img src={Blogo} alt="brand logo" className="me-2 mb-4" width="260" height="110"/>
          <div>
            <h4 className="mt-3 fw-semibold">Unlock your next great read</h4>
          </div>
          <div>
            <p className="mt-2">
              Discover a world of stories, knowledge, and adventure.
              Join a vibrant community of readers and writers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;