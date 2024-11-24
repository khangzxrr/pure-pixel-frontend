import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import FollowApi from "../../apis/FollowApi";
import { useKeycloak } from "@react-keycloak/web";
import { ConfigProvider, Modal } from "antd";
import LoginWarningModal from "../ComLoginWarning/LoginWarningModal";

const FollowButton = ({ photographer }) => {
  const { keycloak } = useKeycloak();
  const [isOpenLoginModal, setIsOpenLoginModal] = React.useState(false);
  const queryClient = useQueryClient();

  const checkIsfollowed = () => {
    return photographer.isFollowed;
  };

  const followMutation = useMutation({
    mutationFn: (followingId) => FollowApi.followPhotographer(followingId),
  });

  const unFollowMutation = useMutation({
    mutationFn: (followingId) => FollowApi.unFollow(followingId),
  });

  const handleFollow = () => {
    followMutation.mutate(photographer.id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["followings-me"] });
        // queryClient.invalidateQueries({ queryKey: ["photographers"] });
        queryClient.invalidateQueries({ queryKey: ["me"] });
        photographer.isFollowed = true;
      },
      onError: (error) => {
        console.error("Follow error:", error);
      },
    });
  };

  const handleUnFollow = () => {
    unFollowMutation.mutate(photographer.id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["followings-me"] });
        queryClient.invalidateQueries({ queryKey: ["me"] });

        photographer.isFollowed = false;
      },
      onError: (error) => {
        console.error("Unfollow error:", error);
      },
    });
  };

  const handleLoginWarning = () => {
    setIsOpenLoginModal(true);
  };
  const handleCloseLoginWarning = () => {
    setIsOpenLoginModal(false);
  };
  return (
    <>
      <ConfigProvider
        theme={{
          components: {
            Modal: {
              contentBg: "#292b2f",
              headerBg: "#292b2f",
              titleColor: "white",
            },
          },
        }}
      >
        <Modal
          title=""
          visible={isOpenLoginModal} // Use state from Zustand store
          onCancel={handleCloseLoginWarning} // Close the modal on cancel
          footer={null}
          width={500} // Set the width of the modal
          centered={true}
          className="custom-close-icon"
        >
          <LoginWarningModal onCloseLogin={handleCloseLoginWarning} />
        </Modal>
      </ConfigProvider>

      {keycloak?.authenticated ? (
        <div
          className={`px-5 py-2 rounded-sm  transition-color duration-200 ${
            checkIsfollowed()
              ? "bg-[#4e78cb] hover:bg-[#5b72a1]"
              : "bg-[#6b7280] hover:bg-[#4d525c]"
          }`}
        >
          <button onClick={checkIsfollowed() ? handleUnFollow : handleFollow}>
            {checkIsfollowed() ? "Đang theo dõi" : "Theo dõi"}
          </button>
        </div>
      ) : (
        <div className="px-5 py-2 rounded-sm transition duration-200 bg-[#6b7280] hover:bg-[#4d525c]">
          <button onClick={handleLoginWarning}>Theo dõi</button>
        </div>
      )}
    </>
  );
};

export default FollowButton;
