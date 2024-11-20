import React from "react";
import { Modal, List, message } from "antd";
import useUploadPhotoStore from "../../../states/UploadPhotoState";
import { useNavigate } from "react-router-dom";

export default function OverviewModal() {
  const { photoArray, isOpenDraftModal, setIsOpenDraftModal, clearState } =
    useUploadPhotoStore();
  const navigate = useNavigate();

  const handleOk = async () => {
    clearState();
    message.success("saved all uploaded photos!");
    navigate("/my-photo/photo/all");
    setIsOpenDraftModal(false);
  };

  const handleCancel = () => {
    setIsOpenDraftModal(false);
  };

  return (
    <div>
      <Modal
        title="Bản thảo"
        visible={isOpenDraftModal}
        onOk={handleOk}
        onCancel={handleCancel}
        width={1000}
      >
        <List
          itemLayout="horizontal"
          dataSource={photoArray}
          renderItem={(item) => (
            <List.Item>
              <img src={item.thumbUrl} />
              <div>
                <p>{item.title}</p>
                <p>{item.description}</p>
                <p>{item.photoType}</p>
                {item.photoTags.map((tag, index) => (
                  <div key={index}>
                    <p>{tag}</p>
                  </div>
                ))}
                <p>{item.location}</p>
                <p>{item.visibility}</p>
              </div>
              <div></div>
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
}
