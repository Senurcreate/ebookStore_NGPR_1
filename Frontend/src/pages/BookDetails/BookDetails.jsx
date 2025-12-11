import React from 'react';
import Hero from './Banner1';
import Details from './Banner2';
import Recommend from './Recommendation';
import Reviews from "./Reviews";

const BookDetails = () => {
  return (
    <>
        <Hero/>
        <Details />
        <Recommend/>
        <Reviews/>
    </>
  );
};

export default BookDetails;

