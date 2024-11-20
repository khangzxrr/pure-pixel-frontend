import { Tooltip } from "antd";
import { MessageCircleMore } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

export default function ChatButton({ userId }) {
  const navigate = useNavigate();
  return (
    <Tooltip title="Nhắn tin" color="blue">
      <MessageCircleMore
        className="w-5 h-5 ml-2 hover:text-blue-500 z-20"
        onClick={() => {
          navigate(`/message?to=${userId}`);
        }}
      />
    </Tooltip>
  );
}
