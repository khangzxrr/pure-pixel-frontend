import { useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import CameraApi from "../../apis/CameraApi";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import UseCameraStore from "../../states/UseCameraStore";

const CameraTableList = () => {
  const topCameras = 25;

  const setNameCamera = UseCameraStore((state) => state.setNameCamera);
  const setListTopBrandCamera = UseCameraStore(
    (state) => state.setListTopBrandCamera
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["cameras", topCameras],
    queryFn: () => CameraApi.getTopCameras(topCameras),
  });

  useEffect(() => {
    if (data) {
      setListTopBrandCamera(data); // Add the fetched array to Zustand store
    }
  }, [data, setListTopBrandCamera]);

  const handleOnClickCamera = (brand, name) => {
    setNameCamera(brand, name);
  };
  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs uppercase dark:bg-[#1f2123] dark:text-[#eee]">
          <tr>
            <th scope="col" className="px-4 py-3 md:px-6">
              Xếp hạng
            </th>
            <th scope="col" className="px-4 py-3 md:px-6">
              Nhãn hiệu
            </th>
            <th scope="col" className="px-4 py-3 hidden md:table-cell">
              Các mẫu hàng đầu
            </th>
            <th scope="col" className="px-4 py-3 md:px-6">
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
              <td colSpan="4" className="px-6 py-4 text-center text-red-500">
                Error fetching data: {isError.message}
              </td>
            </tr>
          )}
          {!isLoading &&
            !isError &&
            data.map((item, index) => (
              <tr
                key={item.maker.id}
                className="border-b dark:bg-[#2f3136] dark:border-[#434743]"
              >
                <td className="px-4 py-4 md:px-6">{index + 1}</td>
                <td className="px-4 py-4 md:px-6 flex items-center gap-2 text-[#eee]">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-[#eee] overflow-hidden">
                    <img
                      src={item.maker.thumbnail}
                      alt={item.maker.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <Link
                    to={`/explore/camera-brand/${item.maker.id}`}
                    onClick={() => handleOnClickCamera(item.maker.name)}
                  >
                    <span className="hover:underline underline-offset-2">
                      {item.maker.name.split(" ")[0]}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-4 md:px-6 text-[#eee] hidden md:table-cell">
                  {item.maker.cameras.slice(0, 2).map((camera, idx) => (
                    <React.Fragment key={camera.id}>
                      <Link
                        to={`/explore/camera-model/${camera.id}`}
                        onClick={() =>
                          handleOnClickCamera(item.maker.name, camera.name)
                        }
                        className="font-normal hover:underline hover:text-blue-500 underline-offset-2"
                      >
                        {camera.name}
                      </Link>
                      {idx < item.maker.cameras.slice(0, 2).length - 1 && ", "}
                    </React.Fragment>
                  ))}
                </td>
                <td className="px-4 py-4 md:px-6">{item.userCount}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default CameraTableList;
