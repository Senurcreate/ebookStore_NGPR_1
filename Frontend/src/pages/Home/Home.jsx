import React from 'react';
import Hero from './Hero';
//import Categories from "./Categories";
import Banner from "./Banner";
import NewAudiobooks from "./NewAudiobooks";
import BookSectionLoader from "../../components/BookSectionLoader";
{/*import Carousel from './Categories'*/}
import { 
    fetchNewReleases, 
    fetchBestSellers, 
    fetchNewAudiobooks 
} from "../../services/book.service";


const Home = () => {
  return (
    <>
        <Hero/>
        
        {/*<Categories />   next section */}

        {/* REUSABLE SECTION 1: New Releases */}
        <BookSectionLoader 
            title="New Releases" 
            fetchFunction={fetchNewReleases} 
        />
        <Banner />
        <NewAudiobooks />
        {/* REUSABLE SECTION 3: Best Sellers */}
        <BookSectionLoader 
            title="Best Sellers" 
            fetchFunction={fetchBestSellers} 
        />
       {/*} <Carousel/>*/}
        
    </>
  );
};

export default Home;