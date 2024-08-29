import React from "react";

export default function ComText({ tile, context, className }) {
  return (
    <>
      <div className={`gap-2 flex flex-col ${className}`}>
        <p className="font-inter text-[18px] font-light leading-[19.36px]  D text-white">
          {tile}
        </p>
        <p className="font-inter text-[13px] font-light leading-[19.36px]  D text-white">
          {context}
        </p>
      </div>
    </>
  );
}
