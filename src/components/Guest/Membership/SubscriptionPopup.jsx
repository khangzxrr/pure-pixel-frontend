import React, { useState } from "react";
import { ChevronLeft, CreditCard } from "lucide-react";
import ComPriceConverter from "../../ComPriceConverter/ComPriceConverter";

const SubscriptionPopup = ({ onClose, dataBuy, selectUpgrade }) => {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [discountCode, setDiscountCode] = useState("");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 text-white rounded-lg w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-xl font-semibold">Subscribe</h2>
          <div className="w-6"></div>
        </div>

        <div className="p-6 flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-4">Thanh toán:</h3>
            <div className="space-y-4 flex justify-center items-center">
              <img
                src={dataBuy?.mockQrcode}
                alt="QR Code"
                className="w-48 h-48"
              />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-4">Tóm tắt đơn hàng</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold"> {selectUpgrade.name}</h4>
                  <p className="text-sm text-gray-400">
                    {selectUpgrade.minOrderMonth} tháng
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-semibold">
                    <ComPriceConverter>{selectUpgrade.price}</ComPriceConverter>
                  </span>
                  {/* <p className="text-sm text-gray-400 line-through">$238.80</p> */}
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">Tổng tiền phải trả</span>
                  <span className="font-semibold text-xl">
                    <ComPriceConverter>{selectUpgrade.price}</ComPriceConverter>
                  </span>
                </div>
                <button className="w-full bg-white text-gray-900 rounded-lg py-3 font-semibold hover:bg-gray-200 transition-colors">
                  Xác nhận thanh toán
                </button>
                <p className="text-xs text-gray-400 text-center mt-2">
                  Payment automatically renews until cancelled. Cancel at any
                  time.
                </p>
                <div className="flex justify-center space-x-4 mt-4 text-sm text-gray-400">
                  <a href="#" className="hover:text-white">
                    Terms
                  </a>
                  <span>|</span>
                  <a href="#" className="hover:text-white">
                    Privacy
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPopup;
