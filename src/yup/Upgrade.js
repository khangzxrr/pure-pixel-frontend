import * as yup from "yup";

export const Upgrade = yup.object({
    name: yup.string().trim().required("Vui lòng nhập tên gói"),
    minOrderMonth: yup
        .number()
        .typeError("Vui lòng chọn thời hạn")
        .required("Vui lòng chọn thời hạn"),
    maxPhotoQuota: yup
        .number()
        .typeError("Vui lòng chọn thời hạn")
        .required("Vui lòng chọn thời hạn"),
    maxPackageCount: yup
        .number()
        .typeError("Vui lòng chọn thời hạn")
        .required("Vui lòng chọn thời hạn"),
    maxBookingPhotoQuota: yup
        .number()
        .typeError("Vui lòng chọn thời hạn")
        .required("Vui lòng chọn thời hạn"),
    maxBookingVideoQuota: yup
        .number()
        .typeError("Vui lòng chọn thời hạn")
        .required("Vui lòng chọn thời hạn"),
    price: yup
        .string().trim()
        .typeError("Vui lòng nhập giá tiền")
        .required("Vui lòng nhập giá tiền"),
    descriptions: yup
        .array()
        .required("Vui lòng nhập ít nhất một chi tiết gói nâng cấp")
        .of(yup.string().trim().required("Vui lòng nhập chi tiết gói nâng cấp"))
        
});
