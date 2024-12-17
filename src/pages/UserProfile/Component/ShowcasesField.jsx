import { Popconfirm, Tooltip, Upload } from "antd";
import React from "react";
import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import PhotoService from "../../../services/PhotoService";
import { notificationApi } from "../../../Notification/Notification";
import PhotoshootPackageApi from "../../../apis/PhotoshootPackageApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function ShowcasesField({
  photoshootPackageId,
  showcases,
  setShowcases,
  showcasesUrl,
  setShowcasesUrl,
}) {
  const queryClient = useQueryClient();

  const addPhotoshootPackageShowcase = useMutation({
    mutationFn: async ({ photoshootPackageId, newShowcasePhoto }) =>
      PhotoshootPackageApi.addPhotoshootPackageShowcase(photoshootPackageId, {
        newShowcasePhoto: newShowcasePhoto,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["findAllPhotoshootPackages"]);
    },
  });
  const {
    mutateAsync: addPhotoshootPackageShowcaseMutate,
    isPending: addPhotoPending,
  } = addPhotoshootPackageShowcase;
  const onShowcasesChange = async (info) => {
    try {
      const newFile = info.file;

      // Check if the length of showcasesUrl exceeds the limit of 20
      if (showcasesUrl && showcasesUrl.length >= 20) {
        notificationApi(
          "warning",
          "Đã đạt giới hạn ảnh cho bộ sưu tập",
          "Chỉ có thể tải lên nhiều nhiều nhất 20 ảnh cho 1 bộ sưu tập."
        );
        return;
      }
      console.log("newFile.status", newFile.status);
      // Add the new file to the current showcases list
      if (newFile.status === "done") {
        setShowcases((prevShowcases) => {
          const updatedShowcases = [...prevShowcases, newFile.originFileObj];
          return updatedShowcases;
        });

        // Generate the URL for the new file and add it to the current showcasesUrl
        const newUrl = await PhotoService.convertArrayBufferToObjectUrl(
          newFile.originFileObj
        );
        setShowcasesUrl((prevUrls) =>
          Array.from(new Set([...prevUrls, { photoUrl: newUrl }]))
        );
      } else if (newFile.status === "uploading") {
        console.log("uploading");
      } else {
        return;
      }
    } catch (error) {
      console.error("Error in onShowcasesChange:", error);
    }
  };

  const deleteShowcasePhoto = useMutation({
    mutationFn: async ({ showcaseId, photoshootPackageId }) => {
      // Await inside mutation function
      return await PhotoshootPackageApi.deletePhotoshootPackageShowcase(
        showcaseId,
        photoshootPackageId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["photoshoot-package-showcases-by-photographer"],
      });
    },
    onError: (error) => {
      // console.log(error);
      notificationApi(
        "error",
        "Cập nhật gói chụp thất bại",
        "Không thể cập nhật gói của bạn, vui lòng thử lại."
      );
      setDisabled(false);
    },
  });

  const deletePhotoFromShowcases = async (index) => {
    const deletedShowcaseId = showcasesUrl[index].id;
    if (deletedShowcaseId) {
      try {
        await deleteShowcasePhoto.mutateAsync({
          showcaseId: deletedShowcaseId,
          photoshootPackageId: photoshootPackageId,
        });
        // Remove the image from showcases
        const updatedShowcases = showcases.filter((_, i) => i !== index);
        setShowcases(updatedShowcases);

        // Remove the URL from showcasesUrl
        const updatedShowcasesUrl = showcasesUrl.filter((_, i) => i !== index);
        setShowcasesUrl(updatedShowcasesUrl);
      } catch (error) {
        console.error("Error deleting showcase:", error);
      }
    } else {
      console.log("Not found id");
    }
  };
  // Add new showcases
  const customRequest = async ({ file, onError, onSuccess }) => {
    // console.log("customRequest", file);
    try {
      const response = await addPhotoshootPackageShowcaseMutate({
        photoshootPackageId: photoshootPackageId,
        newShowcasePhoto: file,
      });

      onSuccess(response);
    } catch (e) {
      // handleException(file, e);
      console.log("Error in customRequest", e);
      onError(e);
    }
  };
  return (
    <div className="h-2/5 grid grid-cols-5 md:grid-cols-7 grid-rows-5 md:grid-rows-3 gap-2 mt-4 bg-[#43474E] p-3 overflow-y-auto custom-scrollbar">
      <div className="col-span-1 h-full flex flex-col items-center justify-center">
        <Tooltip title="Chọn ảnh cho bộ sưu tập, tối đa 20 ảnh">
          <Upload
            multiple={true}
            accept=".jpg,.jpeg,.png,.gif,.webp"
            name="showcases"
            showUploadList={false}
            onChange={onShowcasesChange}
            customRequest={customRequest}
            disabled={showcases.length >= 20}
          >
            <div className="flex flex-col items-center justify-center p-9 px-9 bg-[#d7d7d8] hover:bg-[#c0c0c0] rounded-md cursor-pointer transition-colors duration-300">
              <UploadOutlined className="text-3xl mb-1" />
              <p className="text-xs text-center">Thêm ảnh cho</p>
              <p className="text-xs text-center">bộ sưu tập</p>
            </div>
          </Upload>
        </Tooltip>
      </div>
      {/* Showcase list */}
      {showcasesUrl &&
        showcasesUrl.length > 0 &&
        showcasesUrl.map((showcase, index) => (
          <div
            key={`showcase-${index}`}
            className="col-span-1  h-full py-2 px-1 relative group"
          >
            <img
              src={showcase.photoUrl}
              alt={`Showcase ${index + 1}`}
              className="w-full h-full object-cover rounded-md"
            />
            <Popconfirm
              title="Bạn có chắc là muốn xóa ảnh này không?"
              okText="Xóa"
              cancelText="Hủy"
              placement="top"
              onConfirm={(e) => {
                e.preventDefault();
                e.stopPropagation();
                deletePhotoFromShowcases(index);
              }}
            >
              <button
                type="button"
                className="absolute top-3 right-2 hover:bg-opacity-70 bg-white text-red-500 hover:text-red-600 text-xl px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <DeleteOutlined className="w-7 h-7" />
              </button>
            </Popconfirm>
          </div>
        ))}

      {/* Placeholder cells */}
      {showcasesUrl &&
        showcasesUrl.length < 20 &&
        [
          ...Array(
            21 - (showcasesUrl.length < 21 ? showcasesUrl.length : 20) - 1
          ),
        ].map((_, index) => (
          <div
            key={`placeholder-${index}`}
            className="col-span-1 h-full bg-[#767676] rounded-md"
          />
        ))}
    </div>
  );
}
