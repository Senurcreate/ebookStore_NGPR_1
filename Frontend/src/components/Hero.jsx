import React from "react";
import heroBg from "../assets/bg_img.jpg";


function Hero() {
  return (
    <section
      className="hero-section d-flex align-items-center"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      <div className="container">
        <div className="row">
          {/* Left Column */}
          <div className="col-md-6 d-flex flex-column justify-content-center">
              <div className="d-flex justify-content-center">
                <button className="btn btn-primary hero-btn font-family-sans-serif">Browse</button>
              </div>
          </div>

          {/* Right Column (optional image area) */}
          <div className="col-md-6"></div>
        </div>
      </div>
    </section>
  );
}

export default Hero;