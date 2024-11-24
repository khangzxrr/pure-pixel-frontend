import React from "react";

const CardTotal = ({ nameCard, totalNumber }) => {
  return (
    <div className="p-3 shadow-xl rounded-md bg-[#eee] text-[#202225] flex flex-col">
      <div className="text-lg font-bold">{nameCard || "cardName"}</div>
      <div className="text-lg">{totalNumber || 9999}</div>
    </div>
  );
};

export default CardTotal;
