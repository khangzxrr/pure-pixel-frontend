import React from "react";
import { useParams } from "react-router-dom";
import CameraChart from "./CameraChart";
import CameraUseChart from "./CameraUseChart";
import CameraPhoto from "./CameraPhoto";
import UseCameraStore from "../../states/UseCameraStore";

const CameraDetail = () => {
  const nameCamera = UseCameraStore((state) => state.nameCamera);
  const brandCamera = UseCameraStore((state) => state.brandCamera);
  console.log(nameCamera, brandCamera);

  return (
    <div className="flex flex-col m-2">
      <div className="flex flex-col items-center lg:flex-row bg-[#2f3136]  h-auto gap-4 m-[5px]">
        <div className="w-full md:w-[400px] h-[400px] bg-[#eee] flex items-center justify-center">
          <img
            src="https://www.transparentpng.com/download/-camera/7mDYcE-nikon-camera-transparent-background-photography.png"
            alt="Nikon D3500"
            className="max-w-full max-h-full object-contain"
          />
        </div>
        <div className="flex flex-col gap-2 w-full md:w-[500px] p-4">
          <div className="font-bold text-2xl">{nameCamera}</div>
          <div className="font-normal text-sm">
            Được xếp hạng thứ <span className="font-bold">#12</span> trên 233
            máy ảnh{" "}
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline underline-offset-2"
            >
              {brandCamera}
            </a>{" "}
            10524 ảnh tải lên từ 125 người dùng vào hôm qua.
          </div>
          <div className="flex flex-col gap-2">
            <div className="font-bold text-lg">Thông số kĩ thuật</div>
            <div className="flex gap-10 border-b-[1px] border-[#565b63] pb-2">
              <div className="min-w-[150px] text-sm">Loại máy ảnh:</div>
              <div className="font-normal text-sm">Digital SLR</div>
            </div>
            <div className="flex gap-10 border-b-[1px] border-[#565b63] pb-2">
              <div className="min-w-[150px] text-sm">
                Độ phân giải cảm biến:
              </div>
              <div className="font-normal text-sm">24.2 Megapixel</div>
            </div>
            <div className="flex gap-10 border-b-[1px] border-[#565b63] pb-2">
              <div className="min-w-[150px] text-sm">Cỡ LCD:</div>
              <div className="font-normal text-sm">3 inch</div>
            </div>
            <div className="flex gap-10 border-b-[1px] border-[#565b63] pb-2">
              <div className="min-w-[150px] text-sm">Hổ trợ thẻ nhớ:</div>
              <div className="font-normal text-sm">SD/SDHC/SDXC</div>
            </div>
            <div className="flex gap-10 border-b-[1px] border-[#565b63] pb-2">
              <div className="min-w-[150px] text-sm">Trọng lượng:</div>
              <div className="font-normal text-sm">365g</div>
            </div>
            <div className="flex gap-10 border-b-[1px] border-[#565b63] pb-2">
              <div className="min-w-[150px] text-sm">Vành ống kính:</div>
              <div className="font-normal text-sm">Nikon F</div>
            </div>
          </div>
        </div>
        <div className="w-full md:w-[600px] flex items-center justify-center">
          <CameraUseChart />
        </div>
      </div>
      <div>
        <CameraPhoto nameCamera={nameCamera} />
      </div>
    </div>
  );
};

export default CameraDetail;
