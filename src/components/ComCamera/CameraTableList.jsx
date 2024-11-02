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
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs uppercase dark:bg-[#1f2123] dark:text-[#eee]">
          <tr>
            <th scope="col" className="px-6 py-3">
              Xếp hạng
            </th>
            <th scope="col" className="px-6 py-3">
              Nhãn hiệu
            </th>
            <th scope="col" className="px-6 py-3">
              Các mẫu hàng đầu
            </th>
            <th scope="col" className="px-6 py-3">
              Số người sử dụng
            </th>
          </tr>
        </thead>
        <tbody className="text-white">
          {/* Hiển thị thông báo trong bảng */}
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
                <td className="px-6 py-4">{index + 1}</td>
                <td
                  scope="row"
                  className="px-6 py-4 font-medium whitespace-nowrap flex items-center gap-2 text-blue-500"
                >
                  <div className="w-8 h-8">
                    <img
                      src={item.maker.thumbnail}
                      alt={item.maker.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <Link
                    to={`/camera/brand/${item.maker.id}`}
                    onClick={() => handleOnClickCamera(item.maker.name)}
                  >
                    <span className="hover:underline underline-offset-2">
                      {item.maker.name.split(" ")[0]}
                    </span>
                  </Link>
                </td>
                <td className="px-6 py-4 text-blue-500">
                  {item.maker.cameras.slice(0, 2).map((camera, idx) => (
                    <React.Fragment key={camera.id}>
                      <span className="font-normal hover:underline underline-offset-2">
                        <Link
                          to={`/camera/${camera.id}`}
                          onClick={() =>
                            handleOnClickCamera(item.maker.name, camera.name)
                          }
                        >
                          {camera.name}
                        </Link>
                      </span>
                      {idx < item.maker.cameras.slice(0, 2).length - 1 && ", "}
                    </React.Fragment>
                  ))}
                </td>
                <td className="px-6 py-4">{item.userCount}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default CameraTableList;
