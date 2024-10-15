import { Image } from "antd";
import React from "react";

function ComReportConverter({ children }) {
  const convert = (data) => {
    switch (data?.reportType) {
      case "PHOTO":
        return (
          <>
            <div className="w-20 h-20 flex items-center justify-center overflow-hidden">
              <Image
                wrapperClassName=" w-full h-full object-cover object-center flex items-center justify-center "
                src={data?.photo?.signedUrl?.thumbnail}
                alt={data?.photo?.signedUrl?.thumbnail}
                preview={{ mask: "Xem ảnh" }}
              />
            </div>
          </>
        );
      case "USER":
        return (
          <div className="flex gap-2 items-center ">
            {data?.user?.avatar && (
              <div className="w-20 h-20 flex items-center justify-center overflow-hidden">
                <Image
                  wrapperClassName=" w-full h-full object-cover object-center flex items-center justify-center "
                  src={data?.user?.avatar}
                  alt={data?.user?.avatar}
                  preview={{ mask: "Xem ảnh" }}
                />
              </div>
            )}
            <p>{data?.user?.name}</p>
          </div>
        );
      case "BOOKING":
        return "BOOKING";
      case "COMMENT":
        return "Bình luận";
      case "other":
        return "Khác";
      default:
        return " "; // Giá trị mặc định nếu không khớp
    }
  };

  const translated = convert(children);

  return <>{translated}</>;
}

export default ComReportConverter;
