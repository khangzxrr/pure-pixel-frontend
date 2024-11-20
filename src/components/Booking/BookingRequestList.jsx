import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const BookingRequestList = () => {
  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex flex-col gap-2">
        <span className="text-xl">Danh sách lịch hẹn</span>
        <div className="flex gap-5 border-b-2 text-sm font-normal border-[#818181] pb-2 mb-2">
          <NavLink
            to={"pending"}
            className={({ isActive }) =>
              isActive ? "underline underline-offset-2 text-yellow-500" : ""
            }
          >
            Chờ xác nhận
          </NavLink>
          <NavLink
            to={"in-progress"}
            className={({ isActive }) =>
              isActive ? "underline underline-offset-2 text-blue-500" : ""
            }
          >
            Đang thực hiện
          </NavLink>
          <NavLink
            to={"completed"}
            className={({ isActive }) =>
              isActive ? "underline text-green-500 underline-offset-2" : ""
            }
          >
            Hoàn thành
          </NavLink>
          <NavLink
            to={"cancelled"}
            className={({ isActive }) =>
              isActive ? "underline text-red-500 underline-offset-2" : ""
            }
          >
            Đã hủy
          </NavLink>
        </div>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default BookingRequestList;
