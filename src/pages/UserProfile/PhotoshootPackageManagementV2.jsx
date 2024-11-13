import React, { useState } from "react";
import PhotoshootPackageCard from "../../components/Booking/BookingPackageCard";
import PhotoshootPackageApi from "../../apis/PhotoshootPackageApi";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const PhotoshootPackageManagementV2 = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["findAllPhotoshootPackages", page],
    queryFn: () =>
      PhotoshootPackageApi.getAllPhotoshootPackages(itemsPerPage, page - 1),
    keepPreviousData: true,
  });
  const totalPages = data?.totalPage || 1;
  const listPhotoshootPackages = data?.objects || [];
  console.log(listPhotoshootPackages);

  return (
    <div className="min-h-screen p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {listPhotoshootPackages.map((photoshootPackage) => (
          <div
            onClick={() =>
              navigate(`/profile/photoshoot-package/${photoshootPackage.id}`)
            }
          >
            <PhotoshootPackageCard photoshootPackage={photoshootPackage} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotoshootPackageManagementV2;
