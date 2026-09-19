import type { Schema } from "../../apis/types";

// the parts of a ReportDto this converter reads
export type ReportReference = {
  reportType?: Schema<"ReportDto">["reportType"] | "other";
  referencedPhoto?: Pick<Schema<"PhotoDto">, "title"> | null;
  referencedUser?: Pick<Schema<"UserDto">, "name"> | null;
  referencedBooking?: {
    photoshootPackageHistory?: Pick<
      Schema<"PhotoshootPackageHistoryDto">,
      "title"
    >;
  } | null;
};

type ComReportConverterProps = {
  children?: ReportReference | null;
};

function ComReportConverter({ children }: ComReportConverterProps) {
  const convert = (data?: ReportReference | null) => {
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
            <p>
              Ảnh{" "}
              <span className="font-semibold text-white">
                {data?.referencedPhoto?.title}
              </span>
            </p>
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
            <div>
              Người dùng{" "}
              <span className="font-semibold text-white">
                {data?.referencedUser?.name}
              </span>
            </div>
          </>
        );
      case "BOOKING":
        return (
          <div>
            Gói chụp{" "}
            <span className="font-semibold text-white">
              {data?.referencedBooking?.photoshootPackageHistory?.title}
            </span>
          </div>
        );
      case "BOOKING_PHOTOGRAPHER_REPORT_USER":
        return (
          <div>
            Khách của gói chụp{" "}
            <span className="font-semibold text-white">
              {data?.referencedBooking?.photoshootPackageHistory?.title}
            </span>
          </div>
        );
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
