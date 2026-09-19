import { useQuery } from "@tanstack/react-query";
import { ConfigProvider, Pagination, Skeleton } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PhotoshootPackageApi from "../../apis/PhotoshootPackageApi";

import PhotoshootPackageCard from "./BookingPackageCard";

const PhotoshootPackageList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  const { isPending, data } = useQuery({
    queryKey: ["findAllPhotoshootPackages-list", page],
    queryFn: () => PhotoshootPackageApi.findAll(itemsPerPage, page - 1, "desc"),
  });
  const totalPages = data?.totalPage || 1;

  const handlePageClick = (pageNumber: number) => {
    if (pageNumber !== page) {
      setPage(pageNumber);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorBgContainer: "#1e1e1e",
          colorText: "#b3b3b3",
          colorPrimary: "white",
          colorBgTextHover: "#333333",
          colorBgTextActive: "#333333",
          colorTextDisabled: "#666666",
        },
      }}
    >
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
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {isPending ? (
              <>
                <Skeleton active paragraph={{ rows: 12 }} />
                <Skeleton active paragraph={{ rows: 12 }} />
                <Skeleton active paragraph={{ rows: 12 }} />
                <Skeleton active paragraph={{ rows: 12 }} />
              </>
            ) : (
              <>
                {/* a failed request has no objects (reading them threw) */}
                {data?.objects.map((photoshootPackage) => (
                  <div key={photoshootPackage.id}>
                    <PhotoshootPackageCard
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
    </ConfigProvider>
  );
};

export default PhotoshootPackageList;
