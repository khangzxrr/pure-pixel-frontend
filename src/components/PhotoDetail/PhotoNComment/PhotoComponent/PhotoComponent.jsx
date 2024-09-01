import React from "react";
import { useParams } from "react-router-dom";
import PhotoList from "../../../Dashboard/ForYou/PhotoList";

const PhotoComponent = () => {
  const { id } = useParams();

  const photo = PhotoList.find((p) => p.id === parseInt(id));

  if (!photo) {
    return <div className="text-red-500">Photo not found</div>;
  }
  return (
    <div className="flex justify-center items-center ">
      <img src={photo.photo} alt={`Photo ${photo.id}`} />
    </div>
  );
};

export default PhotoComponent;
