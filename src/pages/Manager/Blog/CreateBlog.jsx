import React, { useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import ComButton from "../../../components/ComButton/ComButton";
import { yupResolver } from "@hookform/resolvers/yup";
import ComNumber from "./../../../components/ComInput/ComNumber";
import ComInput from "./../../../components/ComInput/ComInput";
import ComSelect from "../../../components/ComInput/ComSelect";
import { MonyNumber } from "./../../../components/MonyNumber/MonyNumber";
import { useNotification } from "../../../Notification/Notification";
import { postData } from "../../../apis/api";
import { Upgrade } from "../../../yup/Upgrade";
import ComTextArea from './../../../components/ComInput/ComTextArea';

export default function CreateBlog({ onClose, tableRef }) {
  const [disabled, setDisabled] = useState(false);
  const { notificationApi } = useNotification();

  const methods = useForm({
    resolver: yupResolver(Upgrade),
    defaultValues: {
      name: "",
      content: "",
    },
  });
  const {
    handleSubmit,
    register,
    setFocus,
    watch,
    setValue,
    setError,
    control,
    formState: { errors },
    trigger,
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "descriptions",
  });
  const onSubmit = (data) => {
    console.log(data);
    setDisabled(true);
    const change = MonyNumber(
      data.price,
      (message) => setError("price", { message }), // Đặt lỗi nếu có
      () => setFocus("price"), // Đặt focus vào trường price nếu có lỗi
      (value) => (data.price = value)
    );
    if (change !== null) {
      postData("/upgrade-package", {
        ...data,
        status: "ENABLED",
      })
        .then((e) => {
          notificationApi("success", "Thành công", "Đã tạo thành công");
          setDisabled(false);
          setTimeout(() => {
            if (tableRef.current) {
              // Kiểm tra xem ref đã được gắn chưa
              tableRef?.current.reloadData();
            }
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
    } else {
      setDisabled(true);
    }
  };

  console.log("====================================");
  console.log(errors.descriptions);
  console.log("====================================");
  return (
    <div>
      <div className="bg-white">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Tạo gói Nâng cấp
        </h2>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-xl">
            <div className="overflow-y-auto p-4">
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <div className="mt-2.5">
                    <ComInput
                      type="text"
                      label={"Tên gói"}
                      placeholder={"Tên gói"}
                      {...register("name")}
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="mt-2.5">
                    <ComTextArea
                      type={"numbers"}
                      label={"Số lượng gói dịch vụ tối đa "}
                      placeholder={"Vui lòng nhập số lượng gói dịch vụ tối đa "}
                      {...register("content")}
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
