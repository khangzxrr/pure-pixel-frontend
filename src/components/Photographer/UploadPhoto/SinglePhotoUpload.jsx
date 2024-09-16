import { message, Progress } from "antd";

const SinglePhotoUpload = ({
  originNode,
  file,
  handleDoubleClick,
  setSelectedPhoto,
  selectedPhoto,
}) => {
  const handleSelect = () => {
    if (file.status === "PARSED") {
      setSelectedPhoto(file);
    } else {
      message.loading("File is not ready yet.");
    }
  };
  return (
    <div
      className={` ${
        // Ensure the element is positioned
        file.uid === selectedPhoto?.uid
          ? "border-4 border-sky-300 rounded-xl z-50"
          : ""
      }`}
      onDoubleClick={() => handleDoubleClick(file)}
      onClick={() => handleSelect()}
    >
      <div className="z-10">
        {originNode}

        {file.status === "uploading" && (
          <div className="mt-2">
            <Progress percent={file.percent} />
            {/* <span className="text-sm">{file.percent}%</span> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default SinglePhotoUpload;
