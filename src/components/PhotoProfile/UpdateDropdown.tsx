import { useState } from "react";
import { Dropdown, type MenuProps } from "antd";
import { BiDollar, BiDotsVerticalRounded } from "react-icons/bi";
import { IoPencilOutline } from "react-icons/io5";
import { CgRemove } from "react-icons/cg";
import useModalStore from "../../states/UseModalStore";
import { useModalState } from "../../hooks/useModalState";
import PhotoManagementModal from "../PhotoManagementModal/PhotoManagementModal";
import type { Schema } from "../../apis/types";

// the fields of a photo in the "my photos" grid the edit, sell and delete actions use
export type MyPhotoItem = {
  id: string;
  watermark: boolean;
  title: string;
  description: string;
  visibility: Schema<"PhotoVisibility">;
  categories?: Schema<"PhotoCategoryDto">[];
  photoTags?: string[];
  exif: { [key: string]: unknown };
  originalPhotoUrl: string;
  thumbnailPhotoUrl: string;
  status: Schema<"PhotoStatus">;
};

type UpdateDropdownProps = {
  photo: MyPhotoItem;
  totalRecord: number;
  // accepted from callers but not used here
  page?: number;
  // accepted from callers but not used here
  setPage?: (page: number) => void;
};

const UpdateDropdown = ({ photo, totalRecord }: UpdateDropdownProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const {
    setIsUpdatePhotoModal,
    setSelectedPhoto,
    setIsDeletePhotoConfirmModal,
    setDeletePhotoId,
    setNumberOfRecord,
  } = useModalStore();

  const modal = useModalState();

  const items: MenuProps["items"] = [
    {
      key: "1",
      icon: <IoPencilOutline />,
      label: <p className="text-blue-500">Chỉnh sửa</p>,
      onClick: () => {
        setIsUpdatePhotoModal(true);
        setSelectedPhoto({ ...photo, isChangeGPS: false });
      },
    },
    {
      key: "3",
      icon: <BiDollar />,
      label: (
        <p
          className={`${
            photo.status === "BAN"
              ? "text-blue-200 cursor-not-allowed"
              : "text-blue-500"
          } `}
        >
          Đăng bán ảnh
        </p>
      ),
      onClick: () => {
        if (photo.status === "BAN") {
          return;
        } else {
          modal.handleOpen();
        }
      },
    },
    {
      key: "2",
      icon: <CgRemove />,
      label: <span className="text-red-500">Xóa ảnh</span>,
      onClick: () => {
        setDeletePhotoId(photo.id);
        setIsDeletePhotoConfirmModal(true);
        setNumberOfRecord(totalRecord);
        // console.log(totalRecord);
      },
    },
  ];
  // console.log("photo", photo);
  return (
    <div>
      {modal.isModalOpen && (
        <PhotoManagementModal
          close={modal.handleClose}
          id={photo.id}
          data={photo}
        />
      )}

      <div className="absolute top-1 right-1 w-1/12 flex justify-center">
        <Dropdown
          menu={{ items }}
          onOpenChange={(open) => setIsHovered(open)}
          overlayClassName="custom-dropdown"
          trigger={["click"]}
        >
          <div
            className={`py-2 ${
              isHovered
                ? "bg-gray-100 rounded-full bg-opacity-50 text-black"
                : "opacity-80"
            } group-hover:opacity-100 transition-opacity duration-300`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <BiDotsVerticalRounded />
          </div>
        </Dropdown>
      </div>
    </div>
  );
};

export default UpdateDropdown;
