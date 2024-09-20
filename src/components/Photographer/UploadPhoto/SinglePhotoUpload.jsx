import { Image, message, Progress } from "antd";

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
      className={`overflow-hidden ${
        // Ensure the element is positioned
        file.uid === selectedPhoto?.uid
          ? "border-4 border-sky-300 rounded-xl z-50"
          : ""
      }`}
      onDoubleClick={() => handleDoubleClick(file)}
      onClick={() => handleSelect()}
    >
      <div className="z-10 ">
        {file.status === "uploading" ? (
          <div className="p-3  flex border-[1px] border-slate-300 rounded-lg hover:opacity-70">
            <div className="mb-3 flex h-1/4 w-full">
              <img
                className="object-contain object-center "
                src={file.upload_url}
                alt={file.upload_url}
              />
              {/* Optional: Add a message or progress indicator */}
            </div>
          </div>
        ) : (
          { originNode }
        )}
      </div>
    </div>
  );
};

export default SinglePhotoUpload;
