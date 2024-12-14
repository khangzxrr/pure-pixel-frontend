import React from "react";
import { useParams } from "react-router-dom";
import CameraChart from "./CameraChart";
import CameraUseChart from "./CameraUseChart";
import CameraPhoto from "./CameraPhoto";
import UseCameraStore from "../../states/UseCameraStore";
import CameraApi from "../../apis/CameraApi";
import { useQuery } from "@tanstack/react-query";

const CameraDetail = () => {
  const { cameraId } = useParams();
  const nameCamera = UseCameraStore((state) => state.nameCamera);
  const brandCamera = UseCameraStore((state) => state.brandCamera);
  const idCamera = UseCameraStore((state) => state.idCamera);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["camera-detail", cameraId],
    queryFn: () => CameraApi.getCameraById(cameraId),
  });
  if (isLoading) return <p>Đang tải...</p>;
  if (isError) return <p>Lỗi: {error.message}</p>;

  const cameraData = data;

  return (
    <div className="flex flex-col m-2 min-h-screen">
      <div className="flex flex-col  lg:flex-row bg-[#2f3136]  h-auto gap-4 m-[5px]">
        <div className="w-full md:w-[200px] bg-[#eee] flex items-center justify-center">
          <img
            src={cameraData.thumbnail}
            alt="Nikon D3500"
            className="max-w-full max-h-full object-contain"
          />
        </div>
        <div className="flex flex-col justify-start h-full gap-2 w-full  p-4">
          <div className="font-bold text-2xl">{cameraData.name}</div>
          {/* <div className="font-normal text-sm">
            Được xếp hạng thứ <span className="font-bold">#12</span> trên 233
            máy ảnh{" "}
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline underline-offset-2"
            >
              {cameraData.name}
            </a>{" "}
            10524 ảnh tải lên từ 125 người dùng vào hôm qua.
          </div> */}
          <div className="font-normal ">{cameraData.description}</div>
          {/* <div className="flex flex-col gap-2">
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
          </div> */}
        </div>
        {/* <div className="w-full md:w-[600px] flex items-center justify-center">
          <CameraUseChart cameraData={cameraData} />
        </div> */}
      </div>
      <div>
        <CameraPhoto nameCamera={cameraData.name} />
      </div>
    </div>
  );
};

export default CameraDetail;
