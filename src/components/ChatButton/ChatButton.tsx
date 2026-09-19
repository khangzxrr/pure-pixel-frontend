import { Tooltip } from "antd";
import { MessageCircleMore } from "lucide-react";
import { useNavigate } from "react-router-dom";

type ChatButtonProps = {
  // the user to open a conversation with
  userId: string | number;
};

export default function ChatButton({ userId }: ChatButtonProps) {
  const navigate = useNavigate();
  return (
    <Tooltip title="Nhắn tin" color="blue">
      <MessageCircleMore
        className="w-5 h-5 ml-2 hover:text-blue-500 z-20"
        onClick={(e) => {
          e.preventDefault(); // Prevent default behavior (if applicable)
          e.stopPropagation(); // Prevent event from propagating to parent elements
          navigate(`/message?to=${userId}`);
        }}
      />
    </Tooltip>
  );
}
