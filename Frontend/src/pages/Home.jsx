import React from "react";
import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import Categories from "../components/Categories";
import NewReleases from "../components/NewReleases";
import BestSellers from "../components/BestSellers";
import Banner from "../components/Banner";
import NewAudiobooks from "../components/NewAudiobooks";


const Home = () => {
  return (
    <>
      <Hero />
      <Navbar />
      <Categories />  {/* next section */}
      <NewReleases />
      <Banner />
      <NewAudiobooks />
      <BestSellers />
    </>
  );
};

export default Home;
