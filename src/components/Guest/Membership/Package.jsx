import React, { useEffect, useState } from "react";
import UserService from "../../../services/Keycloak";
import { useKeycloak } from "@react-keycloak/web";
import { getData, postData } from "../../../apis/api";
import ComPriceConverter from "../../ComPriceConverter/ComPriceConverter";
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai";
import { useModalState } from "../../../hooks/useModalState";
import ComModal from "../../ComModal/ComModal";
import SubscriptionPopup from "./SubscriptionPopup";
export default function Package() {
  const [dataUpgrade, setDataUpgrade] = useState([]);
  const [selectUpgrade, setselectUpgrade] = useState({});
  const [userUpgrade, setUserUpgrade] = useState({});
  const userData = UserService.getTokenParsed();
  const token = UserService.getToken();
  const { keycloak } = useKeycloak();
  const handleLogin = () => keycloak.login();
  const modal = useModalState();
  const [dataBuy, setDataBuy] = useState({});

  const CallApiUser = () => {
    getData(`/me/current-upgrade-package`)
      .then((e) => {
        setUserUpgrade(e.data.objects);
      })
      .catch((error) => {
        console.log(error);
      });
    getData(`/upgrade-package?limit=10&page=0`)
      .then((e) => {
        setDataUpgrade(e.data.objects);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  useEffect(() => {
    CallApiUser();
  }, []);
  const CallApiUpgrade = (data) => {
    postData(`/upgrade-order`, data)
      .then((e) => {
        setDataBuy(e);
        modal.handleOpen();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handIcon = (number) => {
    if (number > 0) {
      return <AiOutlineCheck style={{ color: "green", fontSize: "24px" }} />;
    } else {
      return <AiOutlineClose style={{ color: "red", fontSize: "24px" }} />;
    }
  };
  return (
    <div className="bg-black py-20">
      <p className="text-center font-inter text-[25px] md:text-[30px] lg:text-[34px] xl:text-[34px]  font-extrabold leading-[66.56px]  text-shadow  text-white">
        Take Advantage of This Exclusive Offer - 50% OFF
      </p>
      <p className=" text-center font-inter p-5 md:px-52 text-[16px] font-light leading-[19.36px]   text-white">
        Step into a fuller experience with our exclusive offer. Continue to
        grow, inspire, and earn with a 500px membership—enhance your creative
        journey without any constraints.
      </p>
      {userData ? (
        <div className="grid gap-14  grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-6 justify-items-center  ">
          {dataUpgrade.map((e, i) => (
            <div
              key={i}
              className="w-[340px]  flex flex-col justify-between gap-6 "
            >
              <div className="bg-[#202225] rounded-[20px] h-full p-4">
                <div className="flex justify-between px-4  py-4  text-white">
                  <div>
                    <p className="font-inter text-[16px] md:text-[16px]  font-extrabold">
                      {e.name}
                    </p>
                    <p className="text-white">{e.minOrderMonth} tháng</p>
                  </div>
                  <div>
                    <p className="font-inter text-[#6bce8e] text-[16px] md:text-[16px] ] font-extrabold bg-[#cdf8d3] p-1 rounded-[10px]">
                      <ComPriceConverter>{e.price}</ComPriceConverter>
                    </p>
                  </div>
                </div>
                <div className=" p-2 bg-[#EDF6FE] mx-4 rounded-[20px] ">
                  Nhiếp ảnh gia đam mê muốn nâng cao kỹ năng và khả năng tiếp
                  xúc với hình ảnh của mình
                </div>
                <table className="p-2 w-full">
                  <tbody className="">
                    {e.descriptions.map((data, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 mx-4 font-medium text-white">
                          <div className="flex gap-4">
                            <AiOutlineCheck
                              style={{ color: "green", fontSize: "24px" }}
                            />
                            {data}
                          </div>
                          <div className={`border-b  mt-4`}></div>
                        </td>
                      </tr>
                    ))}
                    {/* <tr>
                    <td className="px-4 py-2 mx-4 font-medium">
                      <div className="flex gap-4">
                        {handIcon(e.maxPackageCount)}
                        {e.maxPackageCount} Gói dịch vụ
                      </div>
                      <div className={`border-b`}></div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 mx-4 font-medium">
                      <div className="flex gap-4">
                        {handIcon(e.maxBookingPhotoCount)}
                        {e.maxBookingPhotoCount} ảnh/album
                      </div>
                      <div className={`border-b`}></div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 mx-4 font-medium">
                      <div className="flex gap-4">
                        {handIcon(e.maxBookingPhotoCount)}
                        {e.maxBookingVideoCount} video/album
                      </div>
                      <div className={`border-b`}></div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 mx-4 font-medium">
                      <div className="flex gap-4">
                        {handIcon(e.maxPhotoCount)}
                        {e.maxPhotoCount} ảnh có thể bán
                      </div>
                      <div className={`border-b`}></div>
                    </td>
                  </tr> */}
                  </tbody>
                </table>
              </div>
              {userUpgrade?.serviceTransactionId === e.id ? (
                <button
                  // onClick={() => {
                  //   CallApiUpgrade({
                  //     acceptTransfer: true,
                  //     acceptRemovePendingUpgradeOrder: true,
                  //     upgradePackageId: e.id,
                  //     totalMonths: e.minOrderMonth,
                  //   });
                  //   setselectUpgrade(e);
                  // }}
                  className="text-black px-6 py-2 text-center rounded-[20px] bg-white font-extrabold "
                >
                  Đang sửa dụng
                </button>
              ) : (
                <button
                  onClick={() => {
                    CallApiUpgrade({
                      acceptTransfer: true,
                      acceptRemovePendingUpgradeOrder: true,
                      upgradePackageId: e.id,
                      totalMonths: e.minOrderMonth,
                    });
                    setselectUpgrade(e);
                  }}
                  className="text-black px-6 py-2 text-center rounded-[20px] bg-white font-extrabold "
                >
                  Nâng cấp
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-14  grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-6 justify-items-center  ">
          {dataUpgrade.map((e, i) => (
            <div
              key={i}
              className="w-[340px]  flex flex-col justify-between gap-6 "
            >
              <div className="bg-white rounded-[20px] h-full p-4">
                <div className="flex justify-between px-4  py-4 ">
                  <p className="font-inter text-[16px] md:text-[16px]  font-extrabold">
                    {e.name}
                    <p className="text-red-600">{e.minOrderMonth} tháng</p>
                  </p>
                  <div>
                    <p className="font-inter text-[#6bce8e] text-[16px] md:text-[16px] ] font-extrabold bg-[#cdf8d3] p-1 rounded-[10px]">
                      <ComPriceConverter>{e.price}</ComPriceConverter>
                    </p>
                  </div>
                </div>
                <div className=" p-2 bg-[#EDF6FE] mx-4 rounded-[20px] ">
                  {e.text} Nhiếp ảnh gia đam mê muốn nâng cao kỹ năng và khả
                  năng tiếp xúc với hình ảnh của mình
                </div>
                <table className="p-2 w-full">
                  <tbody className="">
                    {e.descriptions.map((data, index) => (
                      <tr>
                        <td className="px-4 py-2 mx-4 font-medium">
                          <div className="flex gap-4">
                            <AiOutlineCheck
                              style={{ color: "green", fontSize: "24px" }}
                            />
                            {data}
                          </div>
                          <div className={`border-b`}></div>
                        </td>
                      </tr>
                    ))}
                    {/* <tr>
                    <td className="px-4 py-2 mx-4 font-medium">
                      <div className="flex gap-4">
                        {handIcon(e.maxPackageCount)}
                        {e.maxPackageCount} Gói dịch vụ
                      </div>
                      <div className={`border-b`}></div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 mx-4 font-medium">
                      <div className="flex gap-4">
                        {handIcon(e.maxBookingPhotoCount)}
                        {e.maxBookingPhotoCount} ảnh/album
                      </div>
                      <div className={`border-b`}></div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 mx-4 font-medium">
                      <div className="flex gap-4">
                        {handIcon(e.maxBookingPhotoCount)}
                        {e.maxBookingVideoCount} video/album
                      </div>
                      <div className={`border-b`}></div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 mx-4 font-medium">
                      <div className="flex gap-4">
                        {handIcon(e.maxPhotoCount)}
                        {e.maxPhotoCount} ảnh có thể bán
                      </div>
                      <div className={`border-b`}></div>
                    </td>
                  </tr> */}
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleLogin}
                className="text-black px-6 py-2 text-center rounded-[20px] bg-white font-extrabold "
              >
                Đăng nhập để nâng cấp
              </button>
            </div>
          ))}
        </div>
      )}
      {modal?.isModalOpen && (
        <SubscriptionPopup
          onClose={modal?.handleClose}
          dataBuy={dataBuy}
          selectUpgrade={selectUpgrade}
        />
      )}
      <ComModal
        width={600}
        // isOpen={modal?.isModalOpen}
        onClose={modal?.handleClose}
      >
        <div className="flex justify-center items-center">
          <div className="p-4">
            <h2 className="text-center font-bold text-lg">Payment Details</h2>

            <div className="mt-4">
              <p className="font-medium">Thanh toán cho đơn hàng ID:</p>
              <p className="text-sm text-gray-600">{dataBuy?.transactionId}</p>
            </div>
            <div className="mt-4 flex justify-center">
              <img
                src={dataBuy?.mockQrcode}
                alt="QR Code"
                className="w-48 h-48"
              />
            </div>

            <div className="mt-4 text-center">
              <a
                href={dataBuy?.paymentQrcodeUrl}
                className="text-blue-600 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Pay Now via QR Code
              </a>
            </div>
            <div className="mt-4">
              <div className="w-[340px]  flex flex-col justify-between gap-6 ">
                <div className="bg-white rounded-[20px] h-full border-black border-2">
                  <div className="flex justify-between px-8  py-4 ">
                    <p className="font-inter text-[16px] md:text-[16px]  font-extrabold">
                      {selectUpgrade.name}
                      <p className="text-red-600">
                        {selectUpgrade.minOrderMonth} tháng
                      </p>
                    </p>
                    <div>
                      <p className="font-inter text-[#6bce8e] text-[16px] md:text-[16px] ] font-extrabold bg-[#cdf8d3] p-1 rounded-[10px]">
                        <ComPriceConverter>
                          {selectUpgrade.price}
                        </ComPriceConverter>
                      </p>
                    </div>
                  </div>
                  <div className=" p-2 bg-[#EDF6FE] mx-4 rounded-[20px]">
                    {selectUpgrade.text} Nhiếp ảnh gia đam mê muốn nâng cao kỹ
                    năng và khả năng tiếp xúc với hình ảnh của mình
                  </div>
                  <table className="p-2 w-full">
                    <tbody className="">
                      <tr>
                        <td className="px-4 py-2 mx-4 font-medium">
                          <div className="flex gap-4">
                            {handIcon(selectUpgrade.maxPackageCount)}
                            {selectUpgrade.maxPackageCount} Gói dịch vụ
                          </div>
                          <div className={`border-b`}></div>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 mx-4 font-medium">
                          <div className="flex gap-4">
                            {handIcon(selectUpgrade.maxBookingPhotoCount)}
                            {selectUpgrade.maxBookingPhotoCount} ảnh/album
                          </div>
                          <div className={`border-b`}></div>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 mx-4 font-medium">
                          <div className="flex gap-4">
                            {handIcon(selectUpgrade.maxBookingPhotoCount)}
                            {selectUpgrade.maxBookingVideoCount} video/album
                          </div>
                          <div className={`border-b`}></div>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 mx-4 font-medium">
                          <div className="flex gap-4">
                            {handIcon(selectUpgrade.maxPhotoCount)}
                            {selectUpgrade.maxPhotoCount} ảnh có thể bán
                          </div>
                          <div className={`border-b`}></div>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 mx-4 font-medium">
                          <div className="flex gap-4">
                            {handIcon(selectUpgrade.maxPackageCount)}
                            {selectUpgrade.maxPackageCount} Gói dịch vụ
                          </div>
                          <div className={`border-b`}></div>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 mx-4 font-medium"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={modal?.handleClose}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </ComModal>
    </div>
  );
}
