import { useMutation, useQuery } from "@tanstack/react-query";
import { Select } from "antd";
import { Info, Link } from "lucide-react";
import PhotoApi from "../../apis/PhotoApi";
import { notificationApi } from "../../Notification/Notification";

export default function OwnerSharePhotoComponent({ photoId, onClose }) {
  const { isPending, error, data } = useQuery({
    queryKey: [`getAvailableResolutionForPhotoId_${photoId}`],
    queryFn: () => PhotoApi.getAvailableResolutionsByPhotoId(photoId),
    enabled: !!photoId,
  });

  const generateShareUrlMutation = useMutation({
    mutationFn: (selectedResolution) =>
      PhotoApi.sharePhotoById(photoId, selectedResolution),
  });

  const handleResolutionSelectChange = async (resString) => {
    const res = JSON.parse(resString);

    const data = await generateShareUrlMutation.mutateAsync({
      width: res.width,
      height: res.height,
    });

    copyToClipboard(data.shareUrl);
  };

  const copyToClipboard = (url) => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        notificationApi("success", "Thành công", "Đã sao chép liên kết");
      })
      .catch((err) => {
        console.error("Failed to copy link: ", err);
      });
  };

  if (isPending) {
    return <div>loading...</div>;
  }

  const availableResSelectMap = data.map((d) => {
    return {
      label: `${d.width}x${d.height}`,
      value: JSON.stringify(d),
    };
  });

  return (
    <div className="bg-white text-gray-800 py-8 px-1 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Chia sẻ hình ảnh</h2>
        <button className="text-gray-500 hover:text-gray-700">
          <Info size={20} />
        </button>
      </div>
      <h3 className="text-lg font-semibold mb-2">Lựa chọn </h3>
      <div className="flex items-center justify-between bg-gray-100 p-3 rounded-md mb-6">
        <div className="flex items-center">
          <Link size={20} className="mr-3 text-gray-500" />
          <span>Chất lượng ảnh</span>
        </div>
        <div className="flex items-center">
          <Select
            placeholder="Chất lượng"
            variant="borderless"
            style={{
              width: 120,
              backgroundColor: "#f3f4f6",
              textAlign: "end",
            }}
            onChange={handleResolutionSelectChange}
            options={availableResSelectMap}
          />
        </div>
      </div>
      <div className="flex justify-between mt-4">
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
