import { useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import CameraApi from "../../apis/CameraApi";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import UseCameraStore from "../../states/UseCameraStore";
import CameraPopular from "./CameraPopular";

const CameraByBrand = () => {
  const { cameraId } = useParams(); // Lấy brandId từ params
  const topCamerasByBrand = 20;
  const brandId = cameraId;

  const setNameCamera = UseCameraStore((state) => state.setNameCamera);
  const brandCamera = UseCameraStore((state) => state.brandCamera);
  const setListTopCameraByBrand = UseCameraStore(
    (state) => state.setListTopCameraByBrand
  );
  const listTopCameraByBrand = UseCameraStore(
    (state) => state.listTopCameraByBrand
  );
  // Thực hiện gọi API
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["camerasByBrand", brandId, topCamerasByBrand],
    queryFn: () => CameraApi.getTopCamerasByBrandId(brandId, topCamerasByBrand),
  });

  useEffect(() => {
    if (data) {
      setListTopCameraByBrand(data); // Add the fetched array to Zustand store
    }
  }, [data, setListTopCameraByBrand]);

  const handleOnClickCamera = (name) => {
    setNameCamera(brandCamera, name);
  };
  return (
    <div className="flex flex-col p-4 gap-5 min-h-screen">
      <div>
        <CameraPopular />
      </div>
      <div className="relative ">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs uppercase dark:bg-[#1f2123] dark:text-[#eee]">
            <tr>
              <th scope="col" className="px-6 py-3">
                Xếp hạng
              </th>
              <th scope="col" className="px-6 py-3">
                Các mã máy ảnh {brandCamera}
              </th>
              <th scope="col" className="px-6 py-3">
                Số ảnh
              </th>
              <th scope="col" className="px-6 py-3">
                Số người sử dụng
              </th>
            </tr>
          </thead>
          <tbody className="text-white">
            {isLoading && (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center">
                  <LoadingSpinner />
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center">
                  Lỗi: {error.message}
                </td>
              </tr>
            )}
            {data &&
              data.map((camera, index) => (
                <tr
                  key={camera.id}
                  className="border-b dark:bg-[#2f3136] dark:border-[#434743]"
                >
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4 text-[#eee]">
                    <Link
                      to={`/explore/camera-model/${camera.id}`}
                      onClick={() => handleOnClickCamera(camera.name)}
                    >
                      <span className="hover:underline hover:text-blue-500 underline-offset-2">
                        {camera.name}
                      </span>
                    </Link>
                  </td>
                  <td className="px-6 py-4">{camera._count.photos}</td>
                  <td className="px-6 py-4">{camera._count.cameraOnUsers}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CameraByBrand;
