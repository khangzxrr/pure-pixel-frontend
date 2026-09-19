import { useState, type ReactNode } from "react";

type ExifListProps = {
  // parsed EXIF tags of a photo (exifr output or the backend's exif object)
  exifData?: Record<string, unknown> | null;
  cameraId?: string | null;
  // accepted from callers but not used here
  onClose?: () => void;
};

// EXIF tags are strings and numbers; anything else is shown as text instead of breaking the render
const toNode = (value: unknown): ReactNode =>
  value === undefined ||
  value === null ||
  typeof value === "string" ||
  typeof value === "number" ||
  typeof value === "boolean"
    ? value
    : String(value);

const ExifList = ({ exifData, cameraId }: ExifListProps) => {
  const [showFull, setShowFull] = useState(false);

  // Check if exifData is undefined or null
  if (!exifData) {
    return <div className="text-[#d7d7d8]">Không có dữ liệu của tấm ảnh</div>;
  }
  // console.log("check", cameraId && cameraId);
  const fields: { label: string; value: ReactNode }[] = [
    {
      label: "Mẫu máy",
      value: cameraId ? (
        <p
        // className="text-blue-500 underline cursor-pointer"
        // onClick={() => {
        //   navigate(`/explore/camera-model/${cameraId}`);
        // }}
        >
          {toNode(exifData.Model)}
        </p>
      ) : (
        <p>{toNode(exifData.Model)}</p>
      ),
    },
    { label: "Hãng sản xuất", value: toNode(exifData.Make) },
    { label: "Loại ống kính", value: toNode(exifData.LensModel) },
    { label: "Hướng chụp", value: toNode(exifData.Orientation) },
    { label: "ISO", value: toNode(exifData.ISO) },
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
    {
      label: "Bản quyền",
      value: toNode(exifData.Copyright), // This field might be undefined or null
    },
  ];

  // Filter out fields where the value is undefined or null
  const filteredFields = fields.filter(
    (field) => field.value !== undefined && field.value !== null
  );

  // Determine which fields to display
  const displayedFields = showFull
    ? filteredFields
    : filteredFields.slice(0, 3);

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
          type="button"
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
