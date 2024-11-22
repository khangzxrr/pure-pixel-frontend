import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import ComButton from "../../../components/ComButton/ComButton";
import { yupResolver } from "@hookform/resolvers/yup";
import ComInput from "./../../../components/ComInput/ComInput";
import ComUpImgOne from "../../../components/ComUpImg/ComUpImgOne";
import { useNotification } from "../../../Notification/Notification";
import { postData } from "../../../apis/api";
import * as Yup from "yup";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const BlogYup = Yup.object().shape({
  title: Yup.string().required("Vui lòng nhập tên bài viết"),
});

export default function CreateBlog({ onClose, tableRef }) {
  const [disabled, setDisabled] = useState(false);
  const { notificationApi } = useNotification();
  const [image, setImages] = useState(null);
  const [content, setContent] = useState("");

  const methods = useForm({
    resolver: yupResolver(BlogYup),
    defaultValues: {
      title: "",
    },
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = methods;

  // Hàm thay đổi hình ảnh
  const onChange = (data) => {
    const selectedImages = data;
    setImages(selectedImages);
  };

  // Hàm xử lý thay đổi nội dung
  const handleContentChange = (value) => {
    setContent(value);
  };

  // Hàm submit form
  const onSubmit = (data) => {
    // Kiểm tra nếu chưa chọn hình ảnh
    if (!image) {
      notificationApi(
        "error",
        "Hình ảnh không hợp lệ",
        "Vui lòng chọn hình ảnh."
      );
      return;
    }

    // Kiểm tra nếu nội dung trống
    if (!content || content === "<p><br></p>") {
      notificationApi(
        "error",
        "Nội dung không hợp lệ",
        "Vui lòng nhập nội dung bài viết."
      );
      return;
    }

    setDisabled(true);
    const formData = new FormData();
    formData.append("thumbnailFile", image);
    for (const key in data) {
      formData.append(key, data[key]);
    }
    formData.append("content", content);
    formData.append("status", "ENABLED");

    postData("/blog", formData)
      .then((response) => {
        notificationApi("success", "Thành công", "Đã tạo thành công");
        setDisabled(false);
        setTimeout(() => {
          if (tableRef.current) {
            tableRef.current.reloadData();
          }
        }, 100);
        onClose();
      })
      .catch((error) => {
        console.error(error);
        setDisabled(false);
        notificationApi("error", "Không thành công", "Vui lòng thử lại");
      });
  };

  return (
    <div>
      <div className="bg-white">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Tạo blog</h2>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-xl">
            <div className="overflow-y-auto p-4">
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <div className="mt-2.5">
                    <ComInput
                      type="text"
                      label={"Tên bài viết"}
                      placeholder={"Tên bài viết"}
                      error={errors.title?.message}
                      required
                      {...register("title")}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="mt-2.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Nội dung bài viết <span className="text-red-500">*</span>
                    </label>
                    <ReactQuill
                      theme="snow"
                      value={content}
                      onChange={handleContentChange}
                      placeholder="Vui lòng nhập nội dung bài viết"
                    />
                    {errors.content && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.content.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <ComUpImgOne
                    onChange={onChange}
                    label={"Hình ảnh Blog"}
                    error={image ? "" : "Vui lòng chọn hình ảnh"}
                    required
                  />
                </div>
              </div>

              <div className="mt-10">
                <ComButton
                  htmlType="submit"
                  disabled={disabled}
                  className={`block w-full rounded-md bg-[#0F296D] text-center text-sm font-semibold text-white shadow-sm hover:bg-[#0F296D] ${
                    disabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {disabled ? "Đang tạo..." : "Tạo mới"}
                </ComButton>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
