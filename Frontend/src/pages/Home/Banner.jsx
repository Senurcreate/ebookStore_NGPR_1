import React from "react";
import { useNavigate } from "react-router-dom";
import bannerBg from "../../assets/ad.jpg";

export default function Banner() {
  const navigate = useNavigate();
  return (
    <section className="banner-section d-flex justify-content-center my-5">
      <img
        src={bannerBg}
        alt="Banner"
        className="img-fluid rounded-4 shadow"
        onClick={() => navigate("/e-books")}
        style={{ cursor: "pointer",
          
          
          width: "100%"
         }}
      />
    </section>
  );
}
