import { GiPayMoney, GiReceiveMoney } from "react-icons/gi";
import formatPrice from "./../../utils/FormatPriceUtils";

type CardBalanceProps = {
  balance?: number;
  withdrawal?: number;
};

const CardBalance = ({ balance, withdrawal }: CardBalanceProps) => {
  return (
    <div
      className={`bg-[#32353b] text-[#eee] grid grid-cols-2  py-6 px-5 rounded-sm `}
    >
      <div className="flex flex-col gap-2  border-r border-[#777777]">
        <div className="flex mb-3">
          <div className="p-2 bg-[#44484f] rounded-full ">
            <GiReceiveMoney className="text-green-400" />
          </div>
        </div>
        <div className="font-semibold ">{formatPrice(balance)}</div>
        <div className="text-[#7f848e] text-sm">Tổng số dư ví</div>
      </div>
      <div className="flex flex-col gap-2 ml-2 border-[#777777]">
        <div className="flex mb-3">
          <div className="p-2 bg-[#44484f] rounded-full ">
            <GiPayMoney className="text-red-500" />
          </div>
        </div>
        <div className="font-semibold  ">{formatPrice(withdrawal)}</div>
        <div className="text-[#7f848e] text-sm">Tổng số tiền rút</div>
      </div>
    </div>
  );
};

export default CardBalance;
