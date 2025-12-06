import React from "react";
import bannerBg from "../assets/banner.jpg";

export default function Banner() {
  return (
    <section className="banner-section d-flex justify-content-center my-5">
      <img
        src={bannerBg}
        alt="Banner"
        className="img-fluid rounded-4 shadow"
        //style={{ width: "900px" }}
      />
    </section>
  );
}
