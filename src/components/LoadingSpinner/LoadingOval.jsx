import React from "react";
import { Oval } from "react-loader-spinner";

const LoadingOval = ({ size, color, strongWidth, secondaryColor }) => {
  return (
    <Oval
      visible={true}
      height={size || "80"}
      width={size || "80"}
      color={color || "#eee"}
      secondaryColor={secondaryColor || "#43474e"}
      ariaLabel="oval-loading"
      wrapperStyle={{}}
      wrapperClass=""
      strokeWidth={strongWidth || 1.5}
      strokeWidthSecondary={strongWidth || 1.5}
    />
  );
};

export default LoadingOval;
