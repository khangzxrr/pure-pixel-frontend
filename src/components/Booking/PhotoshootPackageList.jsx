import { useQuery } from "@tanstack/react-query";
import { Pagination, Skeleton } from "antd";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PhotoshootPackageApi from "../../apis/PhotoshootPackageApi";

import PhotoshootPackageCard from "./BookingPackageCard";

const PhotoshootPackageList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  const { isPending, isError, data, error } = useQuery({
    queryKey: ["findAllPhotoshootPackages", page],
    queryFn: () => PhotoshootPackageApi.findAll(itemsPerPage, page - 1),
    keepPreviousData: true,
  });
  const totalPages = data?.totalPage || 1;

  const handlePageClick = (pageNumber) => {
    if (pageNumber !== page) {
      setPage(pageNumber);
    }
  };

  return (
    <div className="min-h-screen p-4 ">
      {totalPages > 1 && (
        <Pagination
          current={page}
          total={totalPages * itemsPerPage}
          onChange={handlePageClick}
          pageSize={itemsPerPage}
          showSizeChanger={false}
          className="flex justify-end my-2"
        />
      )}
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
                <div>
                  <PhotoshootPackageCard
                    key={photoshootPackage.id}
                    photoshootPackage={photoshootPackage}
                    onClick={() => navigate(photoshootPackage.id)}
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
