import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";
import PhotoshootPackageApi from "../../apis/PhotoshootPackageApi";

import PhotoshootPackageCard from "./BookingPackageCard";

const PhotoshootPackageList = () => {
  const navigate = useNavigate();

  const { isPending, isError, data, error } = useQuery({
    queryKey: ["findAllPhotoshootPackages"],
    queryFn: PhotoshootPackageApi.findAll,
  });

  return (
    <div className="min-h-screen p-4 ">
      <div className=" rounded-md p-4">
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isPending ? (
            <>
              <Skeleton active paragraph={{ rows: 12 }} />
              <Skeleton active paragraph={{ rows: 12 }} />
              <Skeleton active paragraph={{ rows: 12 }} />
              <Skeleton active paragraph={{ rows: 12 }} />
            </>
          ) : (
            <>
              {data.objects.map((photoshootPackage) => (
                <div onClick={() => navigate(photoshootPackage.id)}>
                  <PhotoshootPackageCard
                    key={photoshootPackage.id}
                    photoshootPackage={photoshootPackage}
                  />
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoshootPackageList;
