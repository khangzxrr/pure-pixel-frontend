import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { LuPlusCircle } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import type { KeycloakTokenParsed } from "../../services/authTypes";
import UserApi from "../../apis/UserApi";
import CreateNewsModal from "./CreateNewsModal";

type ProfileUploadProps = {
  userInfo?: KeycloakTokenParsed;
};

const ProfileUpload = ({ userInfo }: ProfileUploadProps) => {
  const [openCreateNewsFeed, setOpenCreateNewsFeed] = useState(false);

  const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: ["/me"],
    queryFn: () => UserApi.getApplicationProfile(),
  });
  const userData = data;

  const handleOnClose = () => {
    setOpenCreateNewsFeed(false);
  };

  const handleOpenCreateNewsFeed = () => {
    setOpenCreateNewsFeed(true);
  };
  return (
    <>
      {openCreateNewsFeed && (
        <CreateNewsModal userInfo={userInfo} onClose={handleOnClose} />
      )}
      <div className="grid grid-cols-2 gap-4 w-[400px] md:w-[700px]">
        <div
          onClick={() => navigate("/profile")}
          className="flex justify-center items-center py-4 gap-2 rounded-lg bg-[#2f3136] hover:bg-[#36393f] hover:cursor-pointer transition-colors duration-200"
        >
          <div className="size-14 overflow-hidden rounded-full">
            {" "}
            <img src={userData?.avatar} alt="" className="bg-[#eee]" />
          </div>
          <div>Hồ sơ</div>
        </div>

        <div
          onClick={handleOpenCreateNewsFeed}
          className="flex justify-center items-center py-4 gap-2 rounded-lg bg-[#2f3136] hover:bg-[#36393f] hover:cursor-pointer transition-colors duration-200"
        >
          <div>
            <LuPlusCircle className="text-5xl" />
          </div>
          <div>Tạo bài viết</div>
        </div>
      </div>
    </>
  );
};

export default ProfileUpload;
