import React from 'react';
import Hero from './Hero';
import Banner from "./Banner";
import BookSectionLoader from "../../components/BookSectionLoader";
{/*import Carousel from './Categories'*/}
import { 
    fetchNewReleases, 
    fetchBestSellers, 
    fetchNewAudiobooks,
    fetchSinhalaBooks,
    //fetchEmergingAuthors,
    fetchSinhalaAudiobooks
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

        <BookSectionLoader 
            title="Sinhala Books" 
            fetchFunction={fetchSinhalaBooks} 
        />

        <Banner />

        {/*<BookSectionLoader 
            title="New Emerging Authors" 
            fetchFunction={fetchEmergingAuthors} 
        />*/}

        

        <BookSectionLoader 
            title="New Audiobooks" 
            fetchFunction={fetchNewAudiobooks} 
            type="audiobook" 
        />

        

        <BookSectionLoader 
            title="Best Sellers" 
            fetchFunction={fetchBestSellers} 
        />
       {/*} <Carousel/>*/}

       <BookSectionLoader 
            title="Sinhala Audiobooks" 
            fetchFunction={fetchSinhalaAudiobooks}
            type="audiobook" 
        />
        
    </>
  );
};

export default Home;