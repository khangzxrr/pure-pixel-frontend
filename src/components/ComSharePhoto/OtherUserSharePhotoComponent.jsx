import { FaClipboard } from "react-icons/fa";
import { notificationApi } from "../../Notification/Notification";

export default function OtherUserSharePhotoComponent({ photoId, onClose }) {
  const baseURL = window.location.origin;

  const shareURL = `${baseURL}/photo/${photoId}`;

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(shareURL)
      .then(() => {
        notificationApi("success", "Thành công", "Đã sao chép liên kết");
      })
      .catch((err) => {
        console.error("Failed to copy link: ", err);
      });
  };

  return (
    <div>
      <div className="flex items-center justify-between bg-gray-100 p-3 rounded-md mb-6">
        <span className="text-gray-800 font-mono mr-2 overflow-hidden whitespace-nowrap text-ellipsis">
          {baseURL}/photo/{photoId}
        </span>
        <button onClick={copyToClipboard} className="ml-auto">
          <FaClipboard className="text-gray-500 hover:text-gray-800 cursor-pointer" />
        </button>
      </div>
      <div className="flex justify-between mt-4">
        <button
          onClick={copyToClipboard}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Copy đường dẫn
        </button>
        <button
          onClick={onClose}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Xong
        </button>
      </div>
    </div>
  );
}
