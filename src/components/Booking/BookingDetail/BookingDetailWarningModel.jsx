import React from "react";
import { Modal, Button, ConfigProvider } from "antd";

const BookingDetailWarningModel = ({ visible, onClose, onConfirm }) => {
  return (
    <ConfigProvider
      theme={{
        components: {
          Modal: {
            contentBg: "#2f3136",
            headerBg: "#2f3136",
            titleColor: "white",
          },
        },
      }}
    >
      <Modal
        title="Cảnh báo"
        visible={visible}
        onCancel={onClose}
        footer={[
          <Button key="cancel" onClick={onClose} type="default">
            Hủy
          </Button>,
          <Button key="confirm" onClick={onConfirm} type="primary">
            Xác nhận
          </Button>,
        ]}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="font-normal">
            Hãy chắn chắn rằng khách hàng
            <span className="font-bold"> đã thanh toán hóa đơn </span>
            này!
          </div>
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default BookingDetailWarningModel;
