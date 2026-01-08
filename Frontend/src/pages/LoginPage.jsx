import React, { useState } from "react";
import FormCheck from "react-bootstrap/FormCheck";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Gicon from "../assets/Gicon.svg";
import Blogo from "../assets/BrandLogo.svg";
import "../styles/main.scss";
import 'bootstrap-icons/font/bootstrap-icons.css';

import axios from '../utils/axios';

const LoginPage = () => {
  const [message, setMessage] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { loginUser, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleRoleBasedRedirect = async () => {
  try {
    console.log("1. Auth successful, fetching user profile...");
    
    // CHANGE 1: Use the correct endpoint '/users/me' to match your controller
    const response = await axios.get('/users/me'); 
    
    console.log("2. Full Backend Response:", response.data); 

    // CHANGE 2: Extract role correctly based on your controller structure
    // The controller sends: { success: true, data: { role: "admin", ... } }
    const userData = response.data.data; 
    const role = userData?.role;

    console.log("3. Detected Role:", role);

    if (role === 'admin') {
      console.log(">> Redirecting to Admin Dashboard");
      navigate("/admin/dashboard", { replace: true });
    } else {
      console.log(">> Redirecting to Home (User)");
      navigate("/", { replace: true });
    }

  } catch (error) {
    console.error("REDIRECT ERROR:", error);
    navigate("/");
  }
};

  const onSubmit = async (data) => {
    try {
      setEmailLoading(true);
      await loginUser(data.email, data.password);
      setMessage("");
      await handleRoleBasedRedirect();
    } catch (error) {
      console.error("Login error:", error.code);
      if (error.code === "auth/invalid-email")
        setMessage("Invalid email format.");
      else if (error.code === "auth/user-not-found")
        setMessage("No account found with this email. Please sign up first.");
      else if (error.code === "auth/wrong-password")
        setMessage("Incorrect password. Try again.");
      else if (error.code === "auth/too-many-requests")
        setMessage("Too many failed attempts. Please try again later.");
      else setMessage("Failed to log in. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      await signInWithGoogle();
      await handleRoleBasedRedirect();
    } catch (error) {
      console.error("Google Sign-in error:", error);
      setMessage("Google sign-in failed! Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="split-container">
      {/* LEFT SECTION - Form on LEFT for desktop, BOTTOM for mobile */}
      <div className="left background-secondary">
        <div className="login-form-container">
          <h3 className="mb-2 text-center fw-bold">Welcome Back</h3>
          <p className="text-center fs-8 text-muted">
            Sign in to your ebookstore account
          </p>

          {message && (
            <div className="alert alert-danger text-center p-2">{message}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="Your@email.com"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && (
                <small className="text-danger">{errors.email.message}</small>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <div className="position-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control pe-5"
                  placeholder="Enter your password"
                  {...register("password", { required: "Password is required" })}
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

            {/* Remember Me & Forgot Password - Single line on all screens */}
            <div className="mb-4 d-flex justify-content-between align-items-center">
              <FormCheck className="mb-0">
                <FormCheck.Input type="checkbox" name="remember" />
                <FormCheck.Label className="small">Remember Me</FormCheck.Label>
              </FormCheck>
              <div>
                <a href="/forgot-password" className="small">Forgot Password?</a>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 mb-3"
              disabled={emailLoading || googleLoading}
            >
              {emailLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>

            <button
              type="button"
              className="btn btn-outline-primary w-100 mb-4"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || emailLoading}
            >
              {googleLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Signing In with Google...
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
                  Sign In with Google
                </>
              )}
            </button>

            <div className="text-center">
              <p>
                Don't have an account?{" "}
                <a href="/signup" className="fw-semibold">
                  Sign Up
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT SECTION - Image on RIGHT for desktop, TOP for mobile */}
      <div className="right img-container p-8">
        <div className="brand-container text-center">
          <img
            src={Blogo}
            alt="brand logo"
            className="me-2 mb-8"
            width="260"
            height="110"
          />
          <h4 className="mt-3 fw-semibold">Dive into a world of stories</h4>
          <p className="mt-2">
            Explore an endless collection of ebooks, tailored just for you. Your
            next great adventure awaits.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;