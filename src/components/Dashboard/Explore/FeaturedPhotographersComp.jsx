import React from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import PhotographerCard from "../Following/PhotographerCard";
const FeaturedPhotographersComp = () => {
  let settings = {
    dots: false,
    infinite: false,
    speed: 400,
    slidesToShow: 4,
    slidesToScroll: 3,
  };
  const photographers = new Array(12).fill(null);
  return (
    <div className="bg-gray-300 rounded-xl py-5 px-9  ">
      <Slider {...settings}>
        {photographers.map((_, index) => (
          <div key={index}>
            <PhotographerCard />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default FeaturedPhotographersComp;
