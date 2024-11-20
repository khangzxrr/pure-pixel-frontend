import React from "react";

const UpgradeIntroduce = ({ currentPackage }) => {
  function calculateProgressPercent(startDate, endDate, currentDate) {
    // Convert dates to timestamps for calculation
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const current = new Date(currentDate).getTime();

    // Ensure the current date is within the range of start and end dates
    if (current < start) {
      return 0; // Before start date
    } else if (current > end) {
      return 100; // After end date
    }

    // Calculate the progress percentage
    const progress = ((current - start) / (end - start)) * 100;

    return Math.round(progress * 100) / 100; // Return rounded to two decimal places
  }

  // Example Usage
  const startDate = "2024-11-01";
  const endDate = "2024-11-30";
  const currentDate = "2024-11-16";

  const percent = calculateProgressPercent(startDate, endDate, currentDate);
  console.log(`Progress: ${percent}%`);

  return (
    <div className="flex flex-col bg-[#292b2f] min-h-[150px] rounded-lg items-center justify-center">
      <div className="flex flex-col gap-2 p-2 items-center justify-center">
        <div className="font-bold text-xl text-center">
          NÂNG TẦM SỰ NGHIỆP NHIẾP ẢNH GIA CỦA BẠN
        </div>
        <div className="font-normal text-sm text-center flex flex-col items-center justify-center mx-10">
          Trải nghiệm không giới hạn với tư cách là một nhiếp ảnh gia chuyên
          nghiệp. Đăng tải và lưu trữ ảnh chất lượng cao, chia sẻ tác phẩm của
          bạn ở nhiều định dạng, tạo thu nhập từ việc bán ảnh và cung cấp các
          dịch vụ chụp ảnh. Cùng phát triển và khám phá tiềm năng sáng tạo không
          biên giới của bạn!
        </div>
      </div>
    </div>
  );
};

export default UpgradeIntroduce;
