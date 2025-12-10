import React from 'react';
import Hero from './Banner1';
import Details from './Banner2';
import NewReleases from "../Home/NewReleases";
import Reviews from "./Reviews";

const BookDetails = () => {
  return (
    <>
        <Hero/>
        <Details />
        <NewReleases />
        <Reviews/>
    </>
  );
};

export default BookDetails;

