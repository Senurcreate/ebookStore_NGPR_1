import React from "react";
import heroBg from "../assets/bg_img.jpg"; // replace with your actual hero image
import "../styles/main.scss";

function Hero() {
  return (
    <div className="hero-section" style={styles.hero}>
      <div style={styles.content}>
        <button className="button-primary">Browse</button>
      </div>
    </div>
  );
}

const styles = {
  hero: {
    width: "100vw",
    height: "85vh",
    backgroundImage: `url(${heroBg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    minHeight: "520px",
    position: "relative",
    padding: "20rem 9% 2rem",
    marginTop: 0, // offset for navbar
  },
  content: {
    maxWidth: "600px",
    marginLeft: "150px",
  },
};


export default Hero;