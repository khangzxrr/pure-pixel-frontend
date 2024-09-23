import { Checkbox, Image, message, Progress, Spin, Tooltip } from "antd";
import useUploadPhotoStore from "../../../states/UploadPhotoState";

const SinglePhotoUpload = ({
  originNode,
  file,
  handleDoubleClick,
  setSelectedPhoto,
  selectedPhoto,
}) => {
  const { updateField } = useUploadPhotoStore();
  const handleSelect = () => {
    if (file.status === "PARSED") {
      setSelectedPhoto({
        ...file,
        title: file.name.replace(/\.(png|jpg)$/i, ""),
      });
    } else {
      message.loading("File is not ready yet.");
    }
  };

  console.log("SinglePhotoUpload", file);

  return (
    <div
      className={`overflow-hidden ${
        // Ensure the element is positioned
        file.uid === selectedPhoto?.uid
          ? "border-4 border-sky-300 rounded-xl z-50 transition duration-300"
          : ""
      }`}
      // onDoubleClick={() => handleDoubleClick(file)}
      onClick={() => handleSelect()}
    >
      <div className="z-10 ">
        {file.status === "uploading" ? (
          <div
            className="ant-upload-list-item-container relative"
            style={{ pointerEvents: "none" }} // Disable hover
          >
            <div
              className="ant-upload-list-item ant-upload-list-item-done"
              style={{ pointerEvents: "none" }} // Disable hover
            >
              <a
                className="ant-upload-list-item-thumbnail"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={file.upload_url}
                  alt={file.upload_url}
                  className="ant-upload-list-item-image"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black opacity-20 z-10 flex items-center justify-center rounded-lg"></div>
                <div className="absolute inset-0 opacity-100 z-20 flex items-center justify-center rounded-lg">
                  <Spin />{" "}
                  <p className="text-white text-sm font-bold">
                    {file.percent}%
                  </p>
                </div>
              </a>
            </div>
          </div>
        ) : file.status === "PARSED" ? (
          <div className="relative ">
            <div className="z-50">{originNode}</div>
            <div className="h-4 w-4 m-1 absolute top-0 right-0 flex justify-center items-center z-10">
              <div className="absolute">
                <Tooltip
                  placement="topRight"
                  color="geekblue"
                  title={file.isWatermark ? "Gỡ nhãn" : "Gắn nhãn"}
                >
                  <Checkbox
                    onChange={(e) => {
                      console.log("Checkbox onChange", e.target.checked);
                      updateField(file.id, "isWatermark", e.target.checked);
                    }}
                    checked={file.isWatermark}
                  />
                </Tooltip>
              </div>
            </div>
          </div>
        ) : (
          originNode
        )}
      </div>
    </div>
  );
};

export default SinglePhotoUpload;
