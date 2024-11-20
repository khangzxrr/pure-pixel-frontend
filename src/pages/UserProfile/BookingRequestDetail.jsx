import React from "react";
import { useParams } from "react-router-dom";
import PhotoShootApi from "../../apis/PhotoShootApi";
import { useQuery } from "@tanstack/react-query";
import { Spin, Alert, Card, Typography, Avatar, Badge, Steps } from "antd";
import dayjs from "dayjs";
import UploadBookingPhoto from "../../components/Photographer/Booking/UploadBookingPhoto";

export default function BookingRequestDetail() {
  const { bookingId } = useParams();
  const {
    data: bookingDetail,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["booking-by-id", bookingId],
    queryFn: () => PhotoShootApi.getBookingDetail(bookingId),
  });

  if (isLoading) {
    return <Spin tip="Loading booking details..." />;
  }

  if (isError) {
    return (
      <Alert
        message="Error"
        description={error?.message}
        type="error"
        showIcon
      />
    );
  }

  if (!bookingDetail) {
    return (
      <Alert
        message="No Data"
        description="No booking details found"
        type="info"
        showIcon
      />
    );
  }

  const {
    status,
    startDate,
    endDate,
    originalPhotoshootPackage,
    photoshootPackageHistory,
  } = bookingDetail;

  const getStatusColor = (status) => {
    switch (status) {
      case "ACCEPTED":
        return "green";
      case "PENDING":
        return "orange";
      case "REJECTED":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <div className="flex flex-col p-2">
      <div className="bg-[#d7d8da] p-4 rounded-lg">
        <Steps
          current={1}
          items={[
            {
              //   title: <p className="text-red-500 font-normal">Yêu cầu mới</p>,
              title: "Đã xác nhận",

              // description: "Yêu cầu mới từ khách hàng",
            },
            {
              //   title: <p className="text-green-500 font-normal">Đã xác nhận</p>,
              title: "Đã xác nhận",

              // description: "Đã xác nhận chụp hình",
            },
            {
              //   title: (
              //     <p className="text-green-600 font-normal">Đã thanh toán</p>
              //   ),
              title: "Đã xác nhận",

              // description: "Khách đã thanh toán",
            },
            {
              title: <p className="text-green-700 font-normal">Hoàn thành</p>,

              // description: "Hoàn thành đơn chụp hình",
            },
          ]}
        />
      </div>

      <div className="flex flex-row w-full">
        <Card bordered={false} style={{ width: "100%", margin: "20px auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <Avatar size={64} src={`/${photoshootPackageHistory?.thumbnail}`} />
            <Typography.Title level={4} style={{ marginLeft: "16px" }}>
              {photoshootPackageHistory?.title}
            </Typography.Title>
            <Typography.Text type="secondary">
              {photoshootPackageHistory?.subtitle}
            </Typography.Text>
          </div>
          {/* <img
            width="10%"
            src={originalPhotoshootPackage?.user?.avatar}
            alt={photoshootPackageHistory?.title}
            style={{ marginBottom: "16px" }}
          /> */}
          {/* <Typography.Title level={5}>
            {originalPhotoshootPackage?.user?.name || "Photographer"}
          </Typography.Title> */}

          {/* <div style={{ marginTop: "16px" }}>
            <Typography.Text>
              Price:{" "}
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(photoshootPackageHistory?.price)}
            </Typography.Text>
            <br />
            <Badge color={getStatusColor(status)} text={`Status: ${status}`} />
            <Typography.Text>
              <br />
              Start: {dayjs(startDate).format("YYYY-MM-DD HH:mm")}
              <br />
              End: {dayjs(endDate).format("YYYY-MM-DD HH:mm")}
            </Typography.Text>
          </div> */}
        </Card>
        <div className="w-1/2">hello</div>
      </div>
      <div className="w-full h-2/3 flex overflow-hidden">
        <div className="w-5/6 h-full bg-[#292b2f] p-7 relative flex justify-center items-center overflow-hidden">
          {/* {photoArray.length > 1 && (
                  <>
                    <div
                      className="absolute left-1 top-1/2 transform -translate-y-1/2 text-4xl hover:scale-110 text-white bg-slate-500 p-1 rounded-md opacity-70 hover:opacity-90 cursor-pointer z-10"
                      onClick={() => setPreviousSelectedPhoto()}
                    >
                      <ArrowLeftOutlined />
                    </div>
                    <div
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 text-4xl hover:scale-110 text-white bg-slate-500 p-1 rounded-md opacity-70 hover:opacity-90 cursor-pointer z-10"
                      onClick={() => setNextSelectedPhoto()}
                    >
                      <ArrowRightOutlined />
                    </div>
                  </>
                )} */}
          <img
            src={
              "https://img.freepik.com/free-photo/abstract-autumn-beauty-multi-colored-leaf-vein-pattern-generated-by-ai_188544-9871.jpg"
            }
            className="h-full shadow-gray-600 shadow-xl drop-shadow-none z-0"
            alt="Selected Photo"
          />
        </div>

        <div className="w-1/6 h-full px-3 bg-[#2f3136] overflow-hidden"></div>
        <UploadBookingPhoto bookingId={bookingId} />
      </div>
    </div>
  );
}
