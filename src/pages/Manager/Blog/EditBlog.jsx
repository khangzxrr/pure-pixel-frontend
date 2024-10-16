import React, { useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import ComButton from "../../../components/ComButton/ComButton";
import { yupResolver } from "@hookform/resolvers/yup";
import ComNumber from "../../../components/ComInput/ComNumber";
import ComInput from "../../../components/ComInput/ComInput";
import ComSelect from "../../../components/ComInput/ComSelect";
import { MonyNumber } from "../../../components/MonyNumber/MonyNumber";
import { useNotification } from "../../../Notification/Notification";
import {  putData } from "../../../apis/api";
import { BlogYup } from "../../../yup/Blog";
import ComTextArea from "../../../components/ComInput/ComTextArea";

export default function EditBlog({ selectedUpgrede, onClose, tableRef }) {
  const [disabled, setDisabled] = useState(false);
  const { notificationApi } = useNotification();
  console.log("====================================");
  console.log(selectedUpgrede);
  console.log("====================================");

  useEffect(() => {
    setValue("minOrderMonth", selectedUpgrede.minOrderMonth);
    setValue("maxPhotoQuota", 123123123);
  }, [selectedUpgrede]);

  const methods = useForm({
    resolver: yupResolver(BlogYup),
    values: selectedUpgrede,
  });
  const {
    handleSubmit,
    register,
    setFocus,
    watch,
    setValue,
    setError,
    trigger,
    formState: { errors },
    control,
  } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "descriptions",
  });
  const onSubmit = (data) => {
  putData("/blog", selectedUpgrede.id, {
    ...data,
    status: "ENABLED",
  })
    .then((e) => {
      notificationApi("success", "Thành công", "Đã tạo thành công");
      setDisabled(false);
      setTimeout(() => {
        tableRef();
      }, 100);
      onClose();
    })
    .catch((error) => {
      console.log(error);
      setDisabled(false);
      if (error?.data?.statusCode === 400) {
        setError("name", { message: "Tên gói này đã tồn tại" });
        setFocus("name");
      }
      notificationApi("error", "Không thành công", "Vui lòng thử lại");
    });
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
                      {...register("name")}
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="mt-2.5">
                    <ComTextArea
                      label={"Nội dung bài viết "}
                      placeholder={"Vui lòng nhập Nội dung bài viết "}
                      {...register("content")}
                      rows={5}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <ComButton
                  htmlType="submit"
                  disabled={disabled}
                  className="block w-full rounded-md bg-[#0F296D] text-center text-sm font-semibold text-white shadow-sm hover:bg-[#0F296D] "
                >
                  Tạo mới
                </ComButton>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
