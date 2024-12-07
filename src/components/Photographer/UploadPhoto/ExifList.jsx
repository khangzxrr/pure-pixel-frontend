import React, { useState } from "react";

const ExifList = ({ exifData }) => {
  const [showFull, setShowFull] = useState(false);

  // Check if exifData is undefined or null
  if (!exifData) {
    return <div className="text-[#d7d7d8]">Không có dữ liệu của tấm ảnh</div>;
  }

  const fields = [
    { label: "Mẫu máy", value: exifData.Model },
    { label: "Loại ống kính", value: exifData.LensModel },
    { label: "Hãng sản xuất", value: exifData.Make },
    { label: "Hướng chụp", value: exifData.Orientation },
    { label: "ISO", value: exifData.ISO },
    { label: "Thời gian phơi sáng", value: `${exifData.ExposureTime}s` },
    { label: "Khẩu độ", value: `f/${exifData.FNumber}` },
    { label: "Tiêu cự", value: `${exifData.FocalLength}mm` },
    {
      label: "Độ phân giải X",
      value: `${exifData.XResolution} ${exifData.ResolutionUnit}`,
    },
    {
      label: "Độ phân giải Y",
      value: `${exifData.YResolution} ${exifData.ResolutionUnit}`,
    },
  ];

  const displayedFields = showFull ? fields : fields.slice(0, 3);

  return (
    <div className="exif-info-container p-4 bg-[#292b2f] rounded-lg text-[#d7d7d8]">
      <h2 className="text-lg font-semibold mb-3 text-[#e0e0e0]">
        Thông số bức ảnh
      </h2>
      <ul className="space-y-2">
        {displayedFields.map((field, index) => (
          <li
            key={index}
            className="flex justify-between text-sm border-b border-[#4c4e52] py-2"
          >
            <span className="text-gray-400">{field.label}</span>
            <span className="text-[#d7d7d8]">{field.value}</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-end mt-4">
        <button
          onClick={() => setShowFull(!showFull)}
          className="text-sm text-[#e0e0e0] hover:underline"
        >
          {showFull ? "Thu gọn" : "Xem thêm"}
        </button>
      </div>
    </div>
  );
};

export default ExifList;
