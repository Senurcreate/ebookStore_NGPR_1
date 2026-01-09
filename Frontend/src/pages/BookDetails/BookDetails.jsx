import React from 'react';
import { useParams } from 'react-router-dom';
import Hero from './Banner1';
import Details from './Banner2';
import Recommend from './Recommendation';
import Reviews from "./Reviews";

const BookDetails = () => {
  const { id } = useParams();
  if (!id) return <div>Loading...</div>;
  return (
    <>
        <Hero/>
        <Details />
        <Recommend/>
        <Reviews bookId={id}/>
    </>
  );
};

export default BookDetails;

