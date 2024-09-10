import React from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import PhotographerCard from "../Following/PhotographerCard";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";

function CustomArrow({ direction, onClick }) {
  const icon = direction === "next" ? <FaArrowRight /> : <FaArrowLeft />;

  const arrowStyles = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 1,
    backgroundColor: "#2986f7",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#fff",
    fontSize: "20px",
    transition: "background-color 0.3s ease",
  };

  const positionStyle =
    direction === "next" ? { right: "-50px" } : { left: "-50px" };

  return (
    <div
      style={{ ...arrowStyles, ...positionStyle }}
      onClick={onClick}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#9ac6fb")} // Đổi màu khi hover
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2986f7")} // Trở lại màu cũ khi không hover
    >
      {icon}
    </div>
  );
}

const FeaturedPhotographersComp = () => {
  const settings = {
    dots: false,
    infinite: true,
    slidesToShow: 4,
    slidesToScroll: 2,
    initialSlide: 0,
    nextArrow: <CustomArrow direction="next" />,
    prevArrow: <CustomArrow direction="prev" />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 2,
        },
      },
    ],
  };

  const photographers = new Array(12).fill(null);

  return (
    <div className="relative slider-container">
      <Slider {...settings}>
        {photographers.map((_, index) => (
          <div key={index} className="p-2">
            <PhotographerCard />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default FeaturedPhotographersComp;
