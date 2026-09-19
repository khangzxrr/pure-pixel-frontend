import type { MouseEventHandler } from "react";
import { FiRefreshCw } from "react-icons/fi";

type RefreshButtonProps = {
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

const RefreshButton = ({ onClick }: RefreshButtonProps) => {
  return (
    <button
      onClick={onClick}
      title="Làm mới"
      className="bg-blue-500 group font-semibold  text-[#eee] p-1 rounded-md"
    >
      <FiRefreshCw className="text-2xl" />
    </button>
  );
};

export default RefreshButton;
