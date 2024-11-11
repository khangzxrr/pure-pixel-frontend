import React from "react";
import UseCameraStore from "../../states/UseCameraStore";
import { Link } from "react-router-dom";

const CameraPopularBrand = () => {
  const listTopBrandCamera = UseCameraStore(
    (state) => state.listTopBrandCamera
  );
  const list5BrandCamera = listTopBrandCamera.slice(0, 5);
  const setNameCamera = UseCameraStore((state) => state.setNameCamera);

  const handleOnClickCamera = (brand, name) => {
    setNameCamera(brand, name);
  };
  return (
    <div className="bg-[#2f3136] flex flex-col p-4">
      <div className="text-lg font-normal mb-4">Các loại máy ảnh phổ biến</div>
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {list5BrandCamera.map((item, index) => (
          <div>
            <Link
              to={`/explore/camera-brand/${item.maker.id}`}
              onClick={() => handleOnClickCamera(item.maker.name)}
            >
              <div className="flex flex-col gap-1 items-center justify-center  group">
                <div className="w-[120px] h-[120px] overflow-hidden rounded-md bg-[#eee]">
                  <img
                    src={item.maker?.thumbnail}
                    alt={item.maker?.name || "Camera brand"}
                    className="object-contain w-full h-full"
                  />
                </div>
                <div className="text-lg text-center font-bold text-blue-500">
                  <span className=" group-hover:underline ">
                    {item.maker?.name || "Unknown brand"}
                  </span>
                </div>
              </div>
            </Link>
            <div className="font-normal flex flex-wrap text-sm items-start justify-center h-[40px] text-blue-500">
              {item.maker?.cameras?.slice(0, 3).map((camera, idx) => (
                <div key={camera.id}>
                  <span className="hover:underline underline-offset-2">
                    <Link
                      to={`/camera/${camera.id}`}
                      onClick={() =>
                        handleOnClickCamera(item.maker.name, camera.name)
                      }
                    >
                      {camera.name}
                    </Link>
                  </span>
                  {idx < item.maker.cameras.slice(0, 3).length - 1 && ", "}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CameraPopularBrand;
