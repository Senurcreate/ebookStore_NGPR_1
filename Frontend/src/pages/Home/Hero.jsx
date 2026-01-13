import React from "react";
import heroBg from "../../assets/bg_img.jpg";


function Hero() {
  return (
    <section
      className="hero-section d-flex align-items-center"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
    </section>
  );
}

export default Hero;