import { useState } from "react";
import { Modal, Checkbox, ConfigProvider } from "antd";
import { useStorage } from "../../hooks/useLocalStorage";
import ComButton from "../ComButton/ComButton";
import thanksPhoto from "../../assets/thanks-friends.jpg";

const ComThanksModal = () => {
  // remembered in localStorage only when the user ticks "don't show again"
  const [dismissed, setDismissed] = useStorage("thanksModalDismissed", false);
  const [open, setOpen] = useState(true);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    if (dontShowAgain) {
      setDismissed(true);
    }
    setOpen(false);
  };

  if (dismissed) {
    return null;
  }

  return (
    <ConfigProvider
      theme={{
        components: {
          Modal: {
            contentBg: "#2f3136",
            headerBg: "#2f3136",
            footerBg: "#2f3136",
            titleColor: "white",
          },
        },
      }}
    >
      <Modal
        title="Lời cảm ơn"
        open={open}
        onCancel={handleClose}
        centered
        width={640}
        footer={<ComButton onClick={handleClose}>Đóng</ComButton>}
      >
        <div className="flex flex-col gap-4 text-white">
          <img
            src={thanksPhoto}
            alt="Minh, Trung, Bảo và Khang"
            className="w-full rounded-lg"
          />
          <div className="font-normal">
            Xin cám ơn những người bạn đã giúp tôi dựng nên trang này: Minh,
            Trung, Bảo - From Khang
          </div>
          <Checkbox
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
          >
            <span className="text-white">Không hiển thị lại</span>
          </Checkbox>
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default ComThanksModal;
