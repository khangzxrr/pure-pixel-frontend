import React, { useState } from "react";
import { Modal, Button, List, Avatar } from "antd";
import useUploadPhotoStore from "../../../states/UploadPhotoState";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import PhotoApi from "../../../apis/PhotoApi";

export default function OverviewModal() {
  const {
    isOpenDraftModal,
    setIsOpenDraftModal,
    photoList,
    setIsUpdating,
    clearState,
  } = useUploadPhotoStore();

  const navigate = useNavigate();

  const updatePhotos = useMutation({
    mutationKey: "update-photo",
    mutationFn: async (photos) => await PhotoApi.updatePhotos(photos),
  });
  const handleOk = () => {
    // setIsUpdating(true);
    // await updatePhotos.mutateAsync(photoList);
    // clearState();
    // message.success("saved all uploaded photos!");
    // navigate("/my-photo/photo/all");
    // setIsOpenDraftModal(false);
  };

  const handleCancel = () => {
    setIsOpenDraftModal(false);
  };
  console.log(photoList);

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
          dataSource={photoList}
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
