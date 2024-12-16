import { Image } from "antd";
import React from "react";
import { Link } from "react-router-dom";

function ComReportConverter({ children }) {
  const convert = (data) => {
    switch (data?.reportType) {
      case "PHOTO":
        return (
          <>
            {/* <div className=" flex items-center justify-center overflow-hidden">
              <Image
                wrapperClassName=" w-20 h-20object-cover object-center flex items-center justify-center "
                src={data?.referencedPhoto?.signedUrl?.thumbnail}
                alt={data?.referencedPhoto?.signedUrl?.thumbnail}
                preview={{ mask: "Xem ảnh" }}
              />
            </div> */}
            <p> {data?.referencedPhoto?.title}</p>
            {/* ID:
            <Link
              to={`/photo/${data?.referencedPhoto?.id}`}
            >
              {data?.referencedPhoto?.id}
            </Link> */}
          </>
        );
      case "USER":
        return (
          <>
            <div className="flex gap-2 items-center justify-center  ">
              {/* {data?.referencedUser?.avatar && (
                <div className="w-20 h-20 flex items-center justify-center overflow-hidden">
                  <Image
                    wrapperClassName=" w-full h-full object-cover object-center flex items-center justify-center "
                    src={data?.referencedUser?.avatar}
                    alt={data?.referencedUser?.avatar}
                    preview={{ mask: "Xem ảnh" }}
                  />
                </div>
              )} */}
              {/* <p>ID:{data?.referencedUser?.id}</p> */}
            </div>
            <div>{data?.referencedUser?.name}</div>
          </>
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
