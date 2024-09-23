import { CloudUploadOutlined, DeleteOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import useUploadPhotoStore from "../../states/UploadPhotoState";
import CustomUpload from "../../components/Photographer/UploadPhoto/CustomUpload";
import UploadPhotoInfoBar from "../../components/Photographer/UploadPhoto/UploadPhotoInfoBar";
import { Switch, Tooltip } from "antd";
import OverviewModal from "../../components/Photographer/UploadPhoto/OverviewModal";

export default function UploadPhoto() {
  const [isWatermarkAll, setIsWatermarkAll] = useState(true);
  const { toggleWatermark } = useUploadPhotoStore();

  const handleToggleWatermark = () => {
    setIsWatermarkAll(!isWatermarkAll);
    toggleWatermark(!isWatermarkAll);
  };
  return (
    <div className="flex py-9 h-screen">
      <div className="flex flex-col w-5/6 mx-auto bg-white rounded-lg border-[1px]">
        <div className="w-full flex px-5 py-2 shadow-lg hover:shadow-xl transition-all duration-300">
          <CloudUploadOutlined style={{ fontSize: "48px" }} />
          <p className="text-2xl p-3">Upload your photos</p>
        </div>
        <div className="w-full flex overflow-hidden pt-9 px-6">
          <div className="w-1/2 px-3 flex flex-wrap gap-2">
            <div className="w-full">
              <Tooltip placement="rightTop" color="geekblue">
                <div className="flex items-center">
                  <Switch
                    defaultChecked
                    size="small"
                    onChange={handleToggleWatermark}
                  />
                  {isWatermarkAll ? (
                    <p className="ml-2">Gỡ nhãn toàn bộ ảnh</p>
                  ) : (
                    <p className="ml-2">Gắn nhãn toàn bộ ảnh</p>
                  )}
                </div>
              </Tooltip>
            </div>
            <CustomUpload />
          </div>
          <div className="w-1/2 overflow-y-auto px-3">
            <UploadPhotoInfoBar />
          </div>
        </div>
        <OverviewModal />
      </div>
    </div>
  );
}
