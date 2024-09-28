import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import ComButton from "../../../components/ComButton/ComButton";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import ComTextArea from "./../../../components/ComInput/ComTextArea";
import ComNumber from "./../../../components/ComInput/ComNumber";
import ComInput from "./../../../components/ComInput/ComInput";
import ComSelect from "../../../components/ComInput/ComSelect";

export default function CreateUpgrade() {
  const CreateUpgradeMessenger = yup.object({
    name: yup.string().required("Vui lòng nhập tên gói"),
    time: yup.string().required("Vui lòng chọn thời hạn"),
    price: yup
      .string()
      .typeError("Vui lòng nhập giá tiền")
      .required("Vui lòng nhập giá tiền"),
    description: yup.string().required("Vui lòng nhập chi tiết dịch vụ"),
  });

  const methods = useForm({
    resolver: yupResolver(CreateUpgradeMessenger),
    values: {
      name: "123",
      description: "sss",
    },
  });
  const {
    handleSubmit,
    register,
    setFocus,
    watch,
    setValue,
    setError,
    trigger,
  } = methods;
  const onSubmit = (data) => {
    console.log(data);
  };
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
                      mode="default"
                      options={[
                        {
                          value: "3",
                          label: `3 tháng`,
                        },
                        {
                          value: "6",
                          label: `6 tháng`,
                        },
                        {
                          value: "1",
                          label: `1 năm`,
                        },
                      ]}
                      {...register("time")}
                      required
                    />
                  </div>
                </div>
                <div className="sm:col-span-1">
                  <div className="mt-2.5">
                    <ComNumber
                      type="money"
                      // money
                      defaultValue={1000}
                      min={1000}
                      label={"Số tiền"}
                      placeholder={"Vui lòng nhập số tiền"}
                      {...register("price")}
                      required
                    />
                  </div>
                </div>
                <div className="sm:col-span-1">
                  <div className="mt-2.5">
                    <ComNumber
                      // defaultValue={1000}
                      min={11}
                      label={"Số lượng Gói dịch vụ"}
                      placeholder={"Vui lòng nhập số lượng gói dịch vụ"}
                      {...register("a")}
                      required
                    />
                  </div>
                </div>
                <div className="sm:col-span-1">
                  <div className="mt-2.5">
                    <ComNumber
               
                      
                      defaultValue={1000}
                      min={1000}
                      label={"Số lượng ảnh/album"}
                      placeholder={"Vui lòng nhập số lượng ảnh/album"}
                      {...register("album")}
                      required
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="mt-2.5">
                    <ComNumber
                      // type=""
                      
                      defaultValue={1000}
                      min={1000}
                      label={"Số lượng ảnh upload"}
                      placeholder={"Vui lòng nhập số lượng ảnh upload"}
                      {...register("upload")}
                      required
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="mt-2.5">
                    <ComTextArea
                      type="text"
                      rows={5}
                      label={"Chi tiết gói "}
                      placeholder={"Vui lòng nhập chi tiết "}
                      {...register("description")}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="mt-10">
                <ComButton
                  htmlType="submit"
                  //   disabled={disabled}
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
