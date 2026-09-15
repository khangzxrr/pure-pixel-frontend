import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import ComButton from "../../../components/ComButton/ComButton";
import ComInput from "../../../components/ComInput/ComInput";
import { useNotification } from "../../../Notification/Notification";
import { patchData, postData } from "../../../apis/api";

const ChangeLogYup = Yup.object().shape({
  version: Yup.string()
    .required("Vui lòng nhập phiên bản")
    .max(50, "Phiên bản tối đa 50 ký tự"),
  title: Yup.string()
    .required("Vui lòng nhập tiêu đề")
    .max(200, "Tiêu đề tối đa 200 ký tự"),
  status: Yup.string().oneOf(["DRAFT", "PUBLISHED"]).required(),
});

// creates a new entry, or edits selectedChangeLog when it is given
export default function ChangeLogForm({ selectedChangeLog, onClose, onSaved }) {
  const isEdit = !!selectedChangeLog;
  const [disabled, setDisabled] = useState(false);
  const [content, setContent] = useState(selectedChangeLog?.content || "");
  const { notificationApi } = useNotification();

  const methods = useForm({
    resolver: yupResolver(ChangeLogYup),
    defaultValues: {
      version: selectedChangeLog?.version || "",
      title: selectedChangeLog?.title || "",
      status: selectedChangeLog?.status || "DRAFT",
    },
  });

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = methods;

  const onSubmit = (data) => {
    if (!content || content === "<p><br></p>") {
      notificationApi(
        "error",
        "Nội dung không hợp lệ",
        "Vui lòng nhập nội dung bản cập nhật."
      );
      return;
    }

    setDisabled(true);

    const body = { ...data, content };
    const request = isEdit
      ? patchData("/changelog", selectedChangeLog.id, body)
      : postData("/changelog", body);

    request
      .then(() => {
        notificationApi(
          "success",
          "Thành công",
          isEdit ? "Đã cập nhật" : "Đã tạo thành công"
        );
        if (!isEdit) {
          reset();
          setContent("");
        }
        onSaved?.();
        onClose?.();
      })
      .catch((error) => {
        console.error(error);
        notificationApi("error", "Không thành công", "Vui lòng thử lại");
      })
      .finally(() => {
        setDisabled(false);
      });
  };

  return (
    <div>
      <div className="bg-white">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {isEdit ? "Cập nhật nhật ký" : "Tạo bản cập nhật"}
        </h2>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-xl">
            <div className="overflow-y-auto p-4">
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                <div>
                  <div className="mt-2.5">
                    <ComInput
                      type="text"
                      label={"Phiên bản"}
                      placeholder={"Ví dụ: 1.2.0"}
                      {...register("version")}
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="mt-2.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Trạng thái <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("status")}
                      className="mt-2 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                    >
                      <option value="DRAFT">Bản nháp (chưa hiển thị)</option>
                      <option value="PUBLISHED">Công khai</option>
                    </select>
                    {errors.status && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.status.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="mt-2.5">
                    <ComInput
                      type="text"
                      label={"Tiêu đề"}
                      placeholder={"Tiêu đề bản cập nhật"}
                      {...register("title")}
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="mt-2.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Nội dung <span className="text-red-500">*</span>
                    </label>
                    <ReactQuill
                      theme="snow"
                      value={content}
                      onChange={setContent}
                      placeholder="Những thay đổi trong phiên bản này"
                    />
                  </div>
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
                  {disabled
                    ? "Đang lưu..."
                    : isEdit
                    ? "Cập nhật"
                    : "Tạo mới"}
                </ComButton>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
