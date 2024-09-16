import { Image } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

import React, { useState } from "react";

export default function PhotoCard({
  image,
  setSelectedPhoto,
  deleteImageById,
  selectedPhoto,
  length,
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(image.signedUrl.thumbnail);
  return (
    <div
      className={`relative w-[30%] cursor-pointer ${
        length <= 3 ? "h-1/2" : "pb-[30%]"
      } ${
        image.id === selectedPhoto?.id
          ? " border-4 border-black"
          : " hover:scale-105 transition-all duration-300"
      }`}
      key={image.id}
      onClick={() => setSelectedPhoto(image)}
    >
      <Image
        src={previewImage}
        preview={{
          visible: previewOpen,
          onVisibleChange: (visible) => setPreviewOpen(visible),
          afterOpenChange: (visible) => !visible && setPreviewImage(""),
        }}
      />
      <DeleteOutlined
        className="absolute top-2 right-2 text-white text-xl cursor-pointer hover:text-red-500"
        onClick={(e) => {
          e.stopPropagation(); // Prevent triggering the parent onClick
          deleteImageById(image.id);
        }}
      />
    </div>
  );
}
