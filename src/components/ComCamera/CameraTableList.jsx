import React from "react";
import { Link } from "react-router-dom";

const CameraTableList = () => {
  return (
    <div>
      <div class="relative overflow-x-auto">
        <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead class="text-xs uppercase dark:bg-[#1f2123] dark:text-[#eee]">
            <tr>
              <th scope="col" class="px-6 py-3">
                Xếp hạng
              </th>
              <th scope="col" class="px-6 py-3">
                Nhãn hiệu
              </th>
              <th scope="col" class="px-6 py-3">
                Các mẫu hàng đầu
              </th>
              <th scope="col" class="px-6 py-3">
                Các kiểu mẫu
              </th>
              <th scope="col" class="px-6 py-3">
                Số mẫu máy
              </th>
            </tr>
          </thead>
          <tbody className="text-white">
            <tr class=" border-b dark:bg-[#2f3136] dark:border-[#434743]">
              <td class="px-6 py-4">1</td>
              <th
                scope="row"
                class="px-6 py-4 font-medium  whitespace-nowrap flex items-center gap-2"
              >
                <div className="w-8 h-8">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Apple_logo_white.svg/1200px-Apple_logo_white.svg.png"
                    alt=""
                    className=" w-full h-full object-contain"
                  />
                </div>
                Apple
              </th>
              <td class="px-6 py-4 text-blue-500">
                <span className="hover:underline underline-offset-2">
                  <Link to="/camera/iphone-15-pro-max">iPhone 15 Pro Max</Link>
                </span>
                , {""}
                <span className="hover:underline underline-offset-2">
                  <Link to="/camera/iphone-13">iPhone 13</Link>
                </span>
                , {""}
                <span className="hover:underline underline-offset-2">
                  <Link to="/camera/iphone-14-pro">iPhone 14 Pro</Link>
                </span>
              </td>
              <td class="px-6 py-4">Cameraphone, Point and Shoot, Tablet</td>
              <td class="px-6 py-4">57</td>
            </tr>
            <tr class=" border-b dark:bg-[#2f3136] dark:border-[#434743]">
              <td class="px-6 py-4">2</td>

              <th
                scope="row"
                class="px-6 py-4 font-medium  whitespace-nowrap flex items-center gap-2"
              >
                <div className="w-8 h-8">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Nikon_Logo.svg/2048px-Nikon_Logo.svg.png"
                    alt=""
                    className=" w-full h-full object-contain"
                  />
                </div>
                Nikon
              </th>
              <td class="px-6 py-4 text-blue-500">
                <span className="hover:underline underline-offset-2">
                  <Link to="/camera/nikon-d850">D850</Link>
                </span>
                , {""}
                <span className="hover:underline underline-offset-2">
                  <Link to="/camera/nikon-d750">D750</Link>
                </span>
                , {""}
                <span className="hover:underline underline-offset-2">
                  <Link to="/camera/nikon-z-6ii">Z 6II</Link>
                </span>
                , {""}
                <span className="hover:underline underline-offset-2">
                  <Link to="/camera/nikon-d3500">D3500</Link>
                </span>
                , {""}
              </td>
              <td class="px-6 py-4">
                Digital SLR, Mirrorless Camera, Point and Shoot
              </td>
              <td class="px-6 py-4">233</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CameraTableList;
