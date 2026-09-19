import { Oval } from "react-loader-spinner";

type LoadingOvalProps = {
  size?: string | number;
  color?: string;
  // stroke width of both rings
  strongWidth?: string | number;
  secondaryColor?: string;
};

const LoadingOval = ({
  size,
  color,
  strongWidth,
  secondaryColor,
}: LoadingOvalProps) => {
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
