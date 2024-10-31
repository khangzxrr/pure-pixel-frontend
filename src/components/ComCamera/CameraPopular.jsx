import React from "react";
import UseCameraStore from "../../states/UseCameraStore";
import { Link } from "react-router-dom";

const CameraPopular = () => {
  const brandCamera = UseCameraStore((state) => state.brandCamera);
  const listTopCameraByBrand = UseCameraStore(
    (state) => state.listTopCameraByBrand
  );
  const setNameCamera = UseCameraStore((state) => state.setNameCamera);

  const top5CameraByBrand = listTopCameraByBrand.slice(0, 5);

  const handleOnClickCamera = (name) => {
    setNameCamera(brandCamera, name);
  };
  return (
    <div className="bg-[#2f3136] flex flex-col p-4">
      <div className="text-lg font-normal mb-4">
        Các mã máy ảnh <span className="font-semibold">{brandCamera}</span> phổ
        biến
      </div>
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {top5CameraByBrand.map((item, index) => (
          <Link
            to={`/camera/${item.id}`}
            key={item.id}
            onClick={() => handleOnClickCamera(item.name)}
          >
            <div className="flex flex-col gap-2 items-center justify-center w-full p-2 group">
              <div className="w-[120px] h-[120px] overflow-hidden rounded-md bg-[#eee]">
                <img
                  src="https://purepixel-default.b-cdn.net/default-camera.jpg"
                  alt=""
                  className="object-contain w-full h-full"
                />
              </div>
              <div className="font-semibold text-blue-500 group-hover:underline underline-offset-2">
                {item.name}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CameraPopular;
