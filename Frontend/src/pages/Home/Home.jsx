import React from 'react';
import Hero from './Hero';
import Navbar from "../../components/Navbar";
//import Categories from "./Categories";
import NewReleases from "./NewReleases";
import BestSellers from "./BestSellers";
import Banner from "./Banner";
import NewAudiobooks from "./NewAudiobooks";
{/*import Carousel from './Categories'*/}


const Home = () => {
  return (
    <>
        <Hero/>
        <Navbar />
        {/*<Categories />   next section */}
        <NewReleases />
        <Banner />
        <NewAudiobooks />
        <BestSellers />
       {/*} <Carousel/>*/}
        
    </>
  );
};

export default Home;