import React from "react";
import FeaturedGalleries from "./FeaturedGalleries";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

const FeaturedGalleriesComp = () => {
  let settings = {
    dots: false,
    infinite: false,
    speed: 400,
    slidesToShow: 3,
    slidesToScroll: 3,
  };
  const galleries = new Array(10).fill(null);
  return (
    <div className="bg-gray-300 rounded-xl py-5 px-9  ">
      <Slider {...settings} className="">
        {galleries.map((_, index) => (
          <div key={index}>
            <FeaturedGalleries />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default FeaturedGalleriesComp;
