import calculateDateDifference from "../../utils/calculateDateDifference";
import { useNavigate } from "react-router-dom";
import type { Schema } from "../../apis/types";

type OrtherNotificationProps = {
  notification: Schema<"NotificationDto">;
  onClose: () => void;
};

// REFERENCE TYPE:
// "BAN"
// "UPGRADE_PACKAGE"
// "CHAT"
export default function OrtherNotification({
  notification,
  onClose,
}: OrtherNotificationProps) {
  const navigate = useNavigate();
  const referenceId = String(notification.payload?.id);
  // console.log("notification", notification);
  const handleNavigate = (
    referenceType: Schema<"NotificationDto">["referenceType"],
  ) => {
    switch (referenceType) {
      case "BAN":
        navigate("/");
        break;
      case "CHAT":
        navigate(`/message?to=${referenceId}`);
        break;
      case "UPGRADE_PACKAGE":
        navigate("/profile/userprofile");
        break;
      case "SUCCESS_WITHDRAWAL":
        navigate("/profile/wallet");
        break;
      default:
        break;
    }
  };
  return (
    <div
      className="border-b border-gray-500 px-1 py-2  hover:cursor-pointer hover:bg-gray-500 transition-colors duration-200"
      key={notification.id}
      onClick={() => {
        handleNavigate(notification.referenceType);
        onClose();
      }}
    >
      <div className="flex items-center gap-2 p-2 rounded-sm">
        <div className="w-[35px] h-[35px] overflow-hidden rounded-full">
          {/* <img
            src={
              photoDetail?.signedUrl?.thumbnail ||
              "https://vnn-imgs-a1.vgcloud.vn/image1.ictnews.vn/_Files/2020/03/17/trend-avatar-1.jpg"
            }
            alt=""
            className="w-full h-full object-cover"
          /> */}
        </div>
        <div className={`w-[225px] lg:w-[335px] text-sm lg:text-base`}>
          {notification.content}
        </div>
      </div>
      <div className="text-right text-sm text-gray-400">
        {calculateDateDifference(notification.updatedAt)}
      </div>
    </div>
  );
}
