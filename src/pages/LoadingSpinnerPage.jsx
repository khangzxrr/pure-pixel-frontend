import React from "react";
import { Oval } from "react-loader-spinner";

const LoadingSpinnerPage = () => {
  return (
    <Oval
      visible={true}
      height="85"
      width="85"
      color="#eee"
      secondaryColor="#43474e"
      ariaLabel="oval-loading"
      strokeWidth={1.5}
      strokeWidthSecondary={1.5}
    />
  );
};

export default LoadingSpinnerPage;
