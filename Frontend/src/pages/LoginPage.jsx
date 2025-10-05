import React from 'react'
import  {useState} from 'react'
import FormCheck from 'react-bootstrap/FormCheck';
import Gicon from '../assets/Gicon.svg'
import Blogo from '../assets/BrandLogo.svg'

import "../styles/main.scss"


const LoginPage = () => {
  return (

    <div className="split-container">
      <div className="left background-secondary ">
        {/* Left */}
            <div className="login-form-container">
              <h3 className="mb-2 text-center font-family-serif fw-bold">Welcome Back</h3>
              <p className=" text-center font-family-sans-serif text-secondary heading-spacing fs-6 text-body-tertiary">Sign in to your ebookstore account</p>
              <form>
                <div className="mb-3">
                  <label className="form-label label-text font-family-sans-serif
                  ">Email</label>
                  <input type="email" className="form-control font-family-sans-serif input-text text-secondary fw-lighter" placeholder="Your@email.com" />
                </div>
                <div className="mb-3">
                  <label className="form-label label-text font-family-sans-serif">Password</label>
                  <input type="password" className="form-control font-family-sans-serif  fw-lighter " placeholder="Enter your password" />
                </div>
                <div className= "mb-4">
                  <div className='row'>
                    <div className='col extra-text '>
                      <FormCheck>
                        <FormCheck.Input type="checkbox" name="remember me"/>
                        <FormCheck.Label>Remember Me</FormCheck.Label>
                        
                      </FormCheck>
                    </div>
                    
                    <div className='col extra-text '>
                      
                      <a href="/forgot-password" className='text-end'>Forgot Password?</a>
                      
                    </div>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-100 mb-4">
                  Sign In
                </button>

                <button type="submit" className="btn btn-outline-primary w-100 mb-4">
                  <img src={Gicon} alt="googleicon" className="me-2" width="16" height="16"/>
                  Sign In with Google
                </button>

                <div className='text-center extra-text'>
                <p>Dont have an account?<a href="/forgot-password" className='text-end'>Sign Up</a></p>
                
                </div>
                
              </form>
            </div>
          
          
        </div>
        

        {/* Right*/}
        <div className="right img-container p-8">
          <div className='brand-container text-center'>
            <img src={Blogo} alt="googleicon" className="me-2 mb-8" width="260" height="110"/>
            <div>
              <h4 className="mt-3 fw-semibold">Dive into a world of stories</h4>
            </div>
            <div>
              <p className="mt-2">
              Explore an endless collection of ebooks, tailored just for you.  
              Your next great adventure awaits.
          </p>
            </div>
          </div>
          
          
          
          
         
          
        </div>

        
      </div>
    
  );
};

export default LoginPage