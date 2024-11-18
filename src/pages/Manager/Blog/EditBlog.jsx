import React, { useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import ComButton from "../../../components/ComButton/ComButton";
import { yupResolver } from "@hookform/resolvers/yup";
import ComInput from "../../../components/ComInput/ComInput";
import ComUpImgOne from "../../../components/ComUpImg/ComUpImgOne";
import { useNotification } from "../../../Notification/Notification";
import { patchData, putData } from "../../../apis/api";
import { BlogYup } from "../../../yup/Blog";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function EditBlog({ selectedUpgrede, onClose, tableRef }) {
  const [disabled, setDisabled] = useState(false);
  const { notificationApi } = useNotification();
  const [image, setImages] = useState(null);
  const [content, setContent] = useState(selectedUpgrede.content || "");

  const methods = useForm({
    resolver: yupResolver(BlogYup),
    defaultValues: {
      title: selectedUpgrede.title,
      status: selectedUpgrede.status,
    },
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
    control,
  } = methods;

  const onChange = (data) => {
    setImages(data);
  };

  const onSubmit = (data) => {
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

    // Nếu không thay đổi hình ảnh
    if (!image) {
      patchData("/blog", selectedUpgrede.id, {
        title: data.title,
        content: content,
        status: data.status,
      })
        .then(() => {
          notificationApi("success", "Thành công", "Đã cập nhật");
          setDisabled(false);
          setTimeout(() => {
            tableRef();
          }, 100);
          onClose();
        })
        .catch((error) => {
          console.error(error);
          setDisabled(false);
          notificationApi("error", "Không thành công", "Vui lòng thử lại");
        });
    } else {
      // Nếu có thay đổi hình ảnh
      const formData = new FormData();
      formData.append("thumbnailFile", image);
      formData.append("title", data.title);
      formData.append("content", content);
      formData.append("status", data.status);

      putData("/blog", selectedUpgrede.id, formData)
        .then(() => {
          notificationApi("success", "Thành công", "Đã cập nhật");
          setDisabled(false);
          setTimeout(() => {
            tableRef.current.reloadData();
          }, 100);
          onClose();
        })
        .catch((error) => {
          console.error(error);
          setDisabled(false);
          notificationApi("error", "Không thành công", "Vui lòng thử lại");
        });
    }
  };

  return (
    <div>
      <div className="bg-white">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Cập nhật blog
        </h2>
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
                      {...register("title")}
                      required
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
                      // {...register("content")}
                      onChange={setContent}
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
                    imgUrl={selectedUpgrede?.thumbnail}
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
                  {disabled ? "Đang cập nhật..." : "Cập nhật"}
                </ComButton>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
