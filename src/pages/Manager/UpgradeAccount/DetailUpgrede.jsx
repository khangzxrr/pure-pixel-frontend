import React, { useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import ComButton from "../../../components/ComButton/ComButton";
import { yupResolver } from "@hookform/resolvers/yup";
import ComNumber from "./../../../components/ComInput/ComNumber";
import ComInput from "./../../../components/ComInput/ComInput";
import ComSelect from "../../../components/ComInput/ComSelect";
import { MonyNumber } from "./../../../components/MonyNumber/MonyNumber";
import { useNotification } from "../../../Notification/Notification";
import { putData } from "../../../apis/api";
import { Upgrade } from "../../../yup/Upgrade";
import ComTextArea from "../../../components/ComInput/ComTextArea";

export default function DetailUpgrede({ selectedUpgrede, onClose, tableRef }) {
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
    resolver: yupResolver(Upgrade),
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
    console.log(data);
    setDisabled(true);
    const change = MonyNumber(
      data.price,
      (message) => setError("price", { message }), // Đặt lỗi nếu có
      () => setFocus("price"), // Đặt focus vào trường price nếu có lỗi
      (value) => (data.price = value)
    );
    if (change !== null) {
      putData("/manager/upgrade-package", selectedUpgrede.id, {
        ...data,
        status: "ENABLED",
      })
        .then((e) => {
          notificationApi("success", "Thành công", "Đã cập nhật thành công");
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
    } else {
      setDisabled(true);
    }
  };
  return (
    <div>
      <div className="bg-white">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Chi tiết gói Nâng cấp
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
                      readOnly
                      {...register("name")}
                      required
                    />
                  </div>
                </div>
                <div className="sm:col-span-1">
                  <div div className="mt-2.5">
                    <ComSelect
                      size={"large"}
                      style={{
                        width: "100%",
                      }}
                      label="Thời hạn "
                      placeholder="Thời hạn"
                      onChangeValue={(name, value) => {
                        setValue(name, value);
                      }}
                      readOnly
                      open={false}
                      value={watch("minOrderMonth")}
                      mode="default"
                      options={[
                        {
                          value: 3,
                          label: `3 tháng`,
                        },
                        {
                          value: 6,
                          label: `6 tháng`,
                        },
                        {
                          value: 12,
                          label: `1 năm`,
                        },
                      ]}
                      {...register("minOrderMonth")}
                      required
                    />
                  </div>
                </div>
                <div className="sm:col-span-1">
                  <div className="mt-2.5">
                    <ComNumber
                      type="money"
                      money
                      value={watch("price")}
                      defaultValue={10000}
                      readOnly
                      min={10000}
                      label={"Số tiền"}
                      placeholder={"Vui lòng nhập số tiền"}
                      {...register("price")}
                      required
                    />
                  </div>
                </div>
                <div className="sm:col-span-1">
                  <div className="mt-2.5">
                    <ComInput
                      type={"numbers"}
                      readOnly
                      label={"maxPhotoQuota"}
                      placeholder={"Vui lòng nhập maxPhotoQuota"}
                      {...register("maxPhotoQuota")}
                      required
                    />
                  </div>
                </div>
                <div className="sm:col-span-1">
                  <div className="mt-2.5">
                    <ComInput
                      type={"numbers"}
                      readOnly
                      label={"Số lượng gói dịch vụ tối đa "}
                      placeholder={"Vui lòng nhập số lượng gói dịch vụ tối đa "}
                      {...register("maxPackageCount")}
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="mt-2.5">
                    <ComTextArea
                      readOnly
                      type={"numbers"}
                      rows={5}
                      label={"Tóm tắt về gói"}
                      placeholder={"Vui lòng nhập bản tóm tắt "}
                      {...register("summary")}
                      required
                    />
                  </div>
                </div>
                {fields.map((description, index) => (
                  <div className="sm:col-span-2" key={index}>
                    <div className="mt-2.5">
                      <ComInput
                        id={`description-${index}`}
                        readOnly
                        label={`Chi tiết  ${index + 1} của gói`}
                        placeholder="Vui lòng nhập chi tiết"
                        {...register(`descriptions[${index}]`)}
                        required
                      />
                    </div>
                    {/* <button
                      type="button"
                      onClick={() => remove(index)}
                      className={`text-red-500 mt-1 ${
                        fields.length === 1 ? "hidden" : ""
                      }`} // Ẩn nút xóa khi chỉ có một phần tử
                    >
                      Xóa
                    </button> */}
                  </div>
                ))}
              </div>

              {errors.descriptions?.root?.message && (
                <p className="text-red-600"></p>
              )}
              {/* <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={() => append(" ")}
                  className="mt-4 bg-blackpointer-events-auto rounded-md bg-[#0F296D] px-3 py-2 text-[0.8125rem] font-semibold leading-5 text-white hover:bg-[#0F296D] hover:text-white"
                >
                  Thêm Chi Tiết Gói
                </button>
              </div> */}
              {/* <div className="mt-10">
                <ComButton
                  htmlType="submit"
                  disabled={disabled}
                  className="block w-full rounded-md bg-[#0F296D] text-center text-sm font-semibold text-white shadow-sm hover:bg-[#0F296D] "
                >
                  Cập nhật
                </ComButton>
              </div> */}
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
