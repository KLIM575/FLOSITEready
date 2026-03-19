import React from 'react';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import FeaturedProducts from '../components/home/FeaturedProducts';
import CallToAction from '../components/home/CallToAction';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <FeaturedProducts />
      <CallToAction />
    </div>
  );
};

export default HomePage;
