import React from "react";
import { useParams } from "react-router-dom";
import CameraChart from "./CameraChart";
import CameraUseChart from "./CameraUseChart";
import CameraPhoto from "./CameraPhoto";

const CameraDetail = () => {
  const { id } = useParams();

  return (
    <div className="flex flex-col p-2">
      <div className="flex flex-col lg:flex-row bg-[#2f3136] w-full h-auto gap-4">
        <div className="w-full md:w-[400px] h-[400px] bg-[#eee] flex items-center justify-center">
          <img
            src="https://www.transparentpng.com/download/-camera/7mDYcE-nikon-camera-transparent-background-photography.png"
            alt="Nikon D3500"
            className="max-w-full max-h-full object-contain"
          />
        </div>
        <div className="flex flex-col gap-2 w-full md:w-[500px] p-4">
          <div className="font-bold text-2xl">Nikon D3500</div>
          <div className="font-normal text-sm">
            Được xếp hạng thứ <span className="font-bold">#12</span> trên 233
            máy ảnh{" "}
            <a
              href="https://www.nikon-asia.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500"
            >
              Nikon
            </a>{" "}
            10524 ảnh tải lên từ 125 người dùng vào hôm qua.
          </div>
          <div className="flex flex-col gap-2">
            <div className="font-bold text-xl">Thông số kĩ thuật</div>
            <div className="flex gap-20 border-b-[1px] border-[#565b63] pb-2">
              <div>Loại máy ảnh: </div>
              <div className="font-normal">Digital SLR</div>
            </div>
            <div className="flex gap-5 border-b-[1px] border-[#565b63] pb-2">
              <div>Độ phân giải của cảm biến: </div>
              <div className="font-normal">24.2 Megapixel</div>
            </div>
            <div className="flex gap-5 border-b-[1px] border-[#565b63] pb-2">
              <div>Cỡ LCD: </div>
              <div className="font-normal">3 inch</div>
            </div>
            <div className="flex gap-5 border-b-[1px] border-[#565b63] pb-2">
              <div>Hổ trợ thẻ nhớ: </div>
              <div className="font-normal">SD/SDHC/SDXC</div>
            </div>
            <div className="flex gap-5 border-b-[1px] border-[#565b63] pb-2">
              <div>Trọng lượng: </div>
              <div className="font-normal">365g</div>
            </div>
            <div className="flex gap-5 border-b-[1px] border-[#565b63] pb-2">
              <div>Vành ống kính: </div>
              <div className="font-normal">Nikon F</div>
            </div>
          </div>
        </div>
        <div className="w-full md:w-[600px] flex items-center justify-center">
          <CameraUseChart />
        </div>
      </div>
      <div>
        <CameraPhoto />
      </div>
    </div>
  );
};

export default CameraDetail;
