import { useEffect, useState, type ReactNode } from "react";
import { Modal } from "antd";

type ComModalProps = {
  isOpen?: boolean;
  onClose?: () => void;
  children?: ReactNode;
  title?: ReactNode;
  width?: string | number;
  className?: string;
};

function ComModal({
  isOpen,
  onClose,
  children,
  title,
  width,
  className,
}: ComModalProps) {
  const [key, setKey] = useState(0);

  // remount the content on close so it starts fresh the next time it opens
  useEffect(() => {
    if (!isOpen) {
      setKey((prevKey) => prevKey + 1);
    }
  }, [isOpen]);

  return (
    <Modal
      title={title}
      open={isOpen}
      width={width || 500}
      onCancel={onClose}
      footer={null}
      className={className}
      centered={true}
    >
      <div key={key}>{children}</div>
    </Modal>
  );
}

export default ComModal;
