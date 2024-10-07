import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import PhotographerApi from "../../apis/PhotographerApi";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import DetailedPhotoView from "../../pages/DetailPhoto/DetailPhoto";
import { useNavigate } from "react-router-dom";

const MyPhotoP = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const queryClient = useQueryClient();
  const { data, isFetching, isError, error } = useQuery({
    queryKey: ["my-photo"],
    queryFn: () => PhotographerApi.getMyPhotos(20, 0),
  });
  console.log("data", data.objects);

  if (isFetching) return <LoadingSpinner />;
  if (isError) return JSON.stringify(error);
  const handleOnClick = (id) => {
    queryClient.invalidateQueries({ queryKey: ["get-photo-by-id"] });
    setSelectedImage(id);
    // navigate(`/photo/${id}`, { state: { listImg: photoList } });
  };
  return (
    <>
      {selectedImage && (
        <DetailedPhotoView
          idImg={selectedImage}
          onClose={() => {
            navigate(`/profile/my-photos`);
            setSelectedImage(null);
          }}
          listImg={data.objects}
        />
      )}

      <div className="flex justify-center gap-1 bg-[#2f3136] flex-wrap hover:cursor-pointer">
        {data.objects.map((photo) => (
          <div key={photo.id} className="relative group ">
            <div className="w-[380px] h-[320px] overflow-hidden ">
              <img
                className="w-full h-full object-cover"
                src={photo.signedUrl.thumbnail}
                alt=""
                onClick={() => handleOnClick(photo.id)}
              />
            </div>
            <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white text-center py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-md">
              <div className="flex justify-between px-1">
                <div>{photo.title || "Không xác định"}</div>
                <div>{photo.category.name || "Không xác định"}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default MyPhotoP;
