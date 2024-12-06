import React from "react";
import { Oval } from "react-loader-spinner";

const LoadingOval = () => {
  return (
    <Oval
      visible={true}
      height="80"
      width="80"
      color="#18d8ed"
      secondaryColor="#626869"
      ariaLabel="oval-loading"
      wrapperStyle={{}}
      wrapperClass=""
    />
  );
};

export default LoadingOval;
