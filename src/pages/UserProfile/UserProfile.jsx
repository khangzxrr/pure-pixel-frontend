// Profile.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ProfileLayout from "../../layouts/ProfileLayout";
import { useParams } from "react-router-dom";
import { useGetUserProfileById } from "../../apis/UserProfile";

const UserProfile = () => {
  const { userId } = useParams();
  const { data: userData } = useGetUserProfileById(userId);
  const [scrollY, setScrollY] = useState(0);
  // Adjust this to set a higher default height
  const defaultHeight = 350; // Set the default height here (e.g., 500px)

  // Calculate container height based on scroll position
  const containerHeight = scrollY < 400 ? defaultHeight - scrollY * 0.5 : 0;
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function formatNumber(num) {
    if (num >= 1000000) {
      // For numbers greater than or equal to 1 million
      return (
        (num / 1000000).toFixed(2).replace(".", ",").replace(/,00$/, "") + "tr"
      ); // Replace dot with comma and remove trailing ,00
    } else if (num >= 1000) {
      // For numbers greater than or equal to 1 thousand
      return (
        (num / 1000).toFixed(2).replace(".", ",").replace(/,00$/, "") + "k"
      ); // Replace dot with comma and remove trailing ,00
    }
    return num?.toString(); // Return the number as a string if it's less than 1000
  }

  return (
    <div className="mx-auto">
      {/* Cover Photo with Parallax Effect */}
      <div className="relative">
        <motion.div
          style={{ overflow: "hidden" }} // Hides the overflowed part of the image
          animate={{ height: containerHeight }} // Dynamically change height on scroll
          transition={{ duration: 0.01, ease: "easeInOut" }} // Smooth transition
          className="w-full"
        >
          {/* Button positioned absolutely */}
          <button className="absolute top-4 left-4 z-20 bg-white text-black px-4 py-2 rounded shadow">
            Back
          </button>
          <img
            src={userData?.coverPhoto} // Use coverPhoto from userData
            alt="Cover"
            className="w-full h-auto" // Image maintains its full width and natural height
          />
        </motion.div>
      </div>

      {/* User Info */}
      <div className="mx-auto -mt-16 px-4 relative z-10 flex flex-col items-center">
        <img
          src={userData?.profilePicture} // Use profilePicture from userData
          alt="Profile"
          className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
        />
        <h1 className="text-2xl font-bold text-center">{userData?.username}</h1>
        <p className="text-gray-600 text-center">{userData?.location}</p>
        <p className="mt-2 text-gray-800 text-center">
          {userData?.bio} {/* Use bio from userData */}
          <br />
          Contact:
          <a
            href={`mailto:${userData?.contactEmail}`}
            className="text-blue-500"
          >
            {" "}
            {userData?.contactEmail}
          </a>
        </p>
        <div className="mt-4 flex justify-center">
          <span className="font-semibold">
            {formatNumber(userData?.followers)} Followers
          </span>
          <span className="mx-2">|</span>
          <span className="font-semibold">
            {formatNumber(userData?.following)} Following
          </span>
          <span className="mx-2">|</span>
          <span className="font-semibold">
            {formatNumber(userData?.photoLikes)} Photo Likes
          </span>
          <span className="mx-2">|</span>
          <span className="font-semibold">
            {formatNumber(userData?.photoImpressions)} Photo impressions
          </span>
        </div>
      </div>
      <ProfileLayout />
    </div>
  );
};

export default UserProfile;
