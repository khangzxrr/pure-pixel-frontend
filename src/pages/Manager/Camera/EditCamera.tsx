import { useState } from "react";
import { FormProvider, get, useForm } from "react-hook-form";
import type { RcFile } from "antd/es/upload";
import ComButton from "../../../components/ComButton/ComButton";
import { yupResolver } from "@hookform/resolvers/yup";
import ComInput from "../../../components/ComInput/ComInput";
import ComUpImgOne from "../../../components/ComUpImg/ComUpImgOne";
import { useNotification } from "../../../Notification/Notification";
import { patchData } from "../../../apis/api";
import "react-quill/dist/quill.snow.css";
import ComTextArea from "../../../components/ComInput/ComTextArea";
import { CameraYup, type CameraInput } from "./../../../yup/Camera";
import type { CameraRow } from "./TableCamera";

// description is not validated but still sent
type CameraValues = CameraInput & { description?: string };

type EditCameraProps = {
  selectedUpgrede: Partial<CameraRow>;
  onClose: () => void;
  tableRef: () => void;
};

// patchData rejects with the axios error
const statusCodeOf = (error: unknown): unknown =>
  get(error, "response.data.statusCode");

export default function EditCamera({
  selectedUpgrede,
  onClose,
  tableRef,
}: EditCameraProps) {
  const [disabled, setDisabled] = useState(false);
  const { notificationApi } = useNotification();
  const [image, setImages] = useState<RcFile | null>(null);

  const methods = useForm<CameraValues>({
    resolver: yupResolver(CameraYup),
    defaultValues: {
      name: selectedUpgrede.name,
      description: selectedUpgrede.description,
    },
  });

  const { handleSubmit, register, setError, setFocus } = methods;

  const onChange = (data: RcFile) => {
    setImages(data);
  };

  const onSubmit = (data: CameraValues) => {
    //  console.log('====================================');
    //  console.log(data);
    //  console.log('====================================');

    setDisabled(true);

    // Nếu không thay đổi hình ảnh
    if (!image) {
      const formData = new FormData();
      //  formData.append("thumbnail", image);

      formData.append("name", data.name);
      formData.append("description", String(data.description));

      patchData("/manager/camera", String(selectedUpgrede.id), formData)
        .then(() => {
          notificationApi("success", "Thành công", "Đã cập nhật");
          setDisabled(false);
          setTimeout(() => {
            tableRef();
          }, 100);
          onClose();
        })
        .catch((error: unknown) => {
          console.error(error);
          setDisabled(false);
          notificationApi("error", "Không thành công", "Vui lòng thử lại");
        });
    } else {
      // Nếu có thay đổi hình ảnh
      const formData = new FormData();
      formData.append("thumbnail", image);
      formData.append("name", data.name);
      formData.append("description", String(data.description));
      patchData("/manager/camera", String(selectedUpgrede.id), formData)
        .then(() => {
          notificationApi("success", "Thành công", "Đã cập nhật");
          setDisabled(false);
          setTimeout(() => {
            tableRef();
          }, 100);
          onClose();
        })
        .catch((error: unknown) => {
          console.error(1111, statusCodeOf(error));
          if (statusCodeOf(error)) {
            setFocus("name");
            setError("name", { message: "Tên máy ảnh này đã tồn tại" });
          }
          setDisabled(false);

          notificationApi("error", "Không thành công", "Vui lòng thử lại");
        });
    }
  };

  return (
    <div>
      <div className="bg-white">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Cập nhật camera
        </h2>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-xl">
            <div className="overflow-y-auto p-4">
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <div className="mt-2.5">
                    <ComInput
                      type="text"
                      label={"Tên camera"}
                      placeholder={"Tên camera"}
                      {...register("name")}
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="mt-2.5">
                    <ComTextArea
                      type={"numbers"}
                      rows={5}
                      label={"Chi tiết"}
                      placeholder={"Chi tiết về máy ảnh"}
                      {...register("description")}
                      required
                    />
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
