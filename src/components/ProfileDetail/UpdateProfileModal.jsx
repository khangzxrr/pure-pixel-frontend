import React, { useState, useEffect } from "react";
import {
  Button,
  Checkbox,
  ConfigProvider,
  Input,
  Select,
  Tooltip,
  Modal,
  Spin,
  Upload,
} from "antd";
import { LoadingOutlined, UploadOutlined } from "@ant-design/icons";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { IoLocationSharp } from "react-icons/io5";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import UserProfileApi from "../../apis/UserProfile";
import { useNotification } from "../../Notification/Notification";
import useModalStore from "../../states/UseModalStore";
import PhotoService from "../../services/PhotoService";
// import "./PhotoProfile.css";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

export default function UpdateProfileModal({ userData }) {
  const { notificationApi } = useNotification();
  const queryClient = useQueryClient();
  const { isUpdateProfileModalVisible, setIsUpdateProfileModalVisible } =
    useModalStore();

  const [coverFile, setCoverFile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(userData?.cover || null);
  const [avatarPreview, setAvatarPreview] = useState(userData?.avatar || null);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: userData?.name || "",
      quote: userData?.quote || "",
      location: userData?.location || "",
      mail: userData?.mail || "",
      phonenumber: userData?.phonenumber || "",
    },
  });

  useEffect(() => {
    reset({
      name: userData?.name || "",
      quote: userData?.quote || "",
      location: userData?.location || "",
      mail: userData?.mail || "",
      phonenumber: userData?.phonenumber || "",
    });
    setCoverPreview(userData?.cover || null);
    setAvatarPreview(userData?.avatar || null);
  }, [userData, reset]);

  const updateProfile = useMutation({
    mutationFn: (data) => UserProfileApi.updateUserProfile(data),
    onSuccess: () => {
      notificationApi(
        "success",
        "Cập nhật hồ sơ",
        "Hồ sơ của bạn đã được cập nhật thành công."
      );
      queryClient.invalidateQueries("user-profile");
      setIsUpdateProfileModalVisible(false);
    },
    onError: () => {
      notificationApi(
        "error",
        "Cập nhật thất bại",
        "Không thể cập nhật hồ sơ của bạn. Vui lòng thử lại."
      );
    },
  });

  const { isLoading: isUpdating } = updateProfile;

  const handleUpload = async (info, setter, previewSetter) => {
    const file = info.file;
    setter(file);
    const reviewUrl = await PhotoService.convertArrayBufferToObjectUrl(file);

    previewSetter(reviewUrl);
  };

  const onSubmit = (values) => {
    const data = {
      ...values,
      cover: coverFile,
      avatar: avatarFile,
    };
    updateProfile.mutate(data);
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Select: {
            colorBgContainer: "#292b2f",
            colorBorder: "#4c4e52",
            colorText: "#e0e0e0",
          },
          Modal: {
            contentBg: "#2f3136",
            headerBg: "#2f3136",
            titleColor: "white",
          },
        },
      }}
    >
      <Modal
        title="Cập nhật hồ sơ"
        visible={isUpdateProfileModalVisible}
        onCancel={() => setIsUpdateProfileModalVisible(false)}
        footer={null}
        width={800}
        style={{ top: 20 }}
      >
        <div
          onSubmit={handleSubmit(onSubmit)}
          className="px-4 grid gap-4 h-[88vh] overflow-y-scroll custom-scrollbar"
        >
          {/* Avatar Upload */}
          <label className="text-[#e0e0e0]">Ảnh đại diện</label>
          <Upload
            accept="image/*"
            showUploadList={false}
            beforeUpload={() => false}
            onChange={(info) =>
              handleUpload(info, setAvatarFile, setAvatarPreview)
            }
          >
            <Button icon={<UploadOutlined />}>Tải ảnh đại diện</Button>
          </Upload>
          {avatarPreview && (
            <div className="mt-2">
              <img
                src={avatarPreview}
                alt="Avatar Preview"
                className="w-20 h-20 rounded-full"
              />
            </div>
          )}

          {/* Cover Image Upload */}
          <label className="text-[#e0e0e0]">Ảnh bìa</label>
          <Upload
            accept="image/*"
            showUploadList={false}
            beforeUpload={() => false}
            onChange={(info) =>
              handleUpload(info, setCoverFile, setCoverPreview)
            }
          >
            <Button icon={<UploadOutlined />}>Tải ảnh bìa</Button>
          </Upload>
          {coverPreview && (
            <div className="mt-2">
              <img
                src={coverPreview}
                alt="Cover Preview"
                className="w-4/5 h-[200px] object-cover"
              />
            </div>
          )}

          {/* Name Field */}
          <label className="text-[#e0e0e0]">Tên</label>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                className={`w-[96%] text-[#d7d7d8] bg-[#292b2f] hover:bg-[#292b2f] focus:bg-[#292b2f] px-2 m-2 border-[1px] lg:text-base text-xs focus:outline-none focus:border-[#e0e0e0] hover:border-[#e0e0e0] placeholder:text-[#d7d7d8] ${
                  errors.name ? "border-red-500" : "border-[#4c4e52]"
                }`}
                placeholder="Nhập tên của bạn"
              />
            )}
          />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}

          {/* Quote Field */}
          <label className="text-[#e0e0e0]">Tiểu sử</label>
          <Controller
            name="quote"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Nhập câu nói"
                rows={3}
                className={`w-[96%] text-[#d7d7d8] bg-[#292b2f] hover:bg-[#292b2f] focus:bg-[#292b2f] px-2 m-2 border-[1px] lg:text-base text-xs focus:outline-none focus:border-[#e0e0e0] hover:border-[#e0e0e0] placeholder:text-[#d7d7d8] ${
                  errors.quote ? "border-red-500" : "border-[#4c4e52]"
                }`}
              />
            )}
          />
          {errors.quote && (
            <p className="text-red-500">{errors.quote.message}</p>
          )}

          {/* Location Field */}
          <label className="text-[#e0e0e0]">Địa chỉ</label>
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Nhập địa điểm của bạn"
                className={`w-[96%] text-[#d7d7d8] bg-[#292b2f] hover:bg-[#292b2f] focus:bg-[#292b2f] px-2 m-2 border-[1px] lg:text-base text-xs focus:outline-none focus:border-[#e0e0e0] hover:border-[#e0e0e0] placeholder:text-[#d7d7d8] ${
                  errors.location ? "border-red-500" : "border-[#4c4e52]"
                }`}
              />
            )}
          />
          {errors.location && (
            <p className="text-red-500">{errors.location.message}</p>
          )}
          <div className="grid grid-cols-2 gap-4">
            {/* Email Field */}
            <div className="col-span-2 md:col-span-1">
              <label className="text-[#e0e0e0]">Email</label>
              <Controller
                name="mail"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Nhập email của bạn"
                    type="email"
                    className={`m-2 w-[96%] md:w-11/12 text-[#d7d7d8] bg-[#292b2f] hover:bg-[#292b2f] focus:bg-[#292b2f] px-2 border-[1px] lg:text-base text-xs focus:outline-none focus:border-[#e0e0e0] hover:border-[#e0e0e0] placeholder:text-[#d7d7d8] ${
                      errors.mail ? "border-red-500" : "border-[#4c4e52]"
                    }`}
                  />
                )}
              />
              {errors.mail && (
                <p className="text-red-500">{errors.mail.message}</p>
              )}
            </div>

            {/* Phone Number Field */}
            <div className="col-span-2 md:col-span-1">
              <label className="text-[#e0e0e0]">Số điện thoại</label>
              <Controller
                name="phonenumber"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Nhập số điện thoại của bạn"
                    className={`m-2 w-[96%] md:w-11/12 text-[#d7d7d8] bg-[#292b2f] hover:bg-[#292b2f] focus:bg-[#292b2f] px-2 border-[1px] lg:text-base text-xs focus:outline-none focus:border-[#e0e0e0] hover:border-[#e0e0e0] placeholder:text-[#d7d7d8] ${
                      errors.phonenumber ? "border-red-500" : "border-[#4c4e52]"
                    }`}
                  />
                )}
              />
              {errors.phonenumber && (
                <p className="text-red-500">{errors.phonenumber.message}</p>
              )}
            </div>
          </div>

          {/* Social Links Field */}
          {/* <label className="text-[#e0e0e0]">Liên kết xã hội</label>
          <Controller
            name="socialLinks"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                mode="tags"
                placeholder="Thêm liên kết xã hội"
                tokenSeparators={[","]}
                className="select-dark"
              />
            )}
          /> */}

          {/* Expertises Field */}
          {/* <label className="text-[#e0e0e0]">Chuyên môn</label>
          <Controller
            name="expertises"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                mode="tags"
                placeholder="Thêm chuyên môn"
                tokenSeparators={[","]}
                className="select-dark"
              />
            )}
          /> */}

          {/* Submit Button */}
          <div className="text-center mt-4 flex justify-center">
            <Button
              type="primary"
              onClick={handleSubmit(onSubmit)}
              loading={isUpdating}
              style={{ width: "50%" }}
            >
              {isUpdating ? (
                <Spin indicator={<LoadingOutlined spin />} />
              ) : (
                "Cập nhật hồ sơ"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </ConfigProvider>
  );
}
