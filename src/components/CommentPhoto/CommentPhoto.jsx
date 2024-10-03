import React, { useEffect, useState } from "react";
import { getData, postData } from "../../apis/api";
import ComDateConverter from "../ComDateConverter/ComDateConverter";
import { useKeycloak } from "@react-keycloak/web";
import UserService from "../../services/Keycloak";
import { FiSend } from "react-icons/fi";
export default function CommentPhoto({ id }) {
  const [dataComment, setDataComment] = useState([]);
  const [valueComment, setValueComment] = useState("");
  const { keycloak } = useKeycloak();
  const handleLogin = () => keycloak.login();
  const userData = UserService.getTokenParsed();
  const callApiComment = () => {
    getData(`photo/${id}/comment`)
      .then((e) => {
        setDataComment(e?.data?.reverse());
      })
      .catch((error) => {
        console.log(error);
      });
  };
  useEffect(() => {
    callApiComment();
  }, [id]);
  console.log(dataComment);
  console.log(valueComment);
  const handComment = () => {
    postData(`photo/${id}/comment`, {
      content: valueComment,
    })
      .then((e) => {
        setValueComment("");
        callApiComment();
      })
      .catch((error) => {
        console.log(error);
      });
  };
  return (
    <div className="space-y-4">
      {dataComment?.map((value, index) => (
        <div key={index} className="flex items-start space-x-3">
          <img
            src={value?.user?.avatar}
            alt="Gianni Meini"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <div className="flex items-center flex-wrap">
              <span className="font-medium mr-2">{value?.user?.name}</span>
              <span className="text-xs text-gray-400 ">
                <ComDateConverter>{value?.createdAt}</ComDateConverter>
              </span>
            </div>
            <p className="text-sm" style={{ whiteSpace: "pre-line" }}>
              {value?.content}
            </p>
          </div>
        </div>
      ))}
      {userData ? (
        <div className="sticky bottom-0 ">
          <div className="flex bg-[#202225]">
            <textarea
              className="w-full p-2 border-none focus:ring-0 text-[#eee] placeholder-[#6e6e6e] outline-none resize-none bg-[#202225] rounded-md"
              rows="2"
              value={valueComment}
              onChange={(e) => {
                setValueComment(e.target.value);
              }}
              placeholder="Viết bình luận của bạn..."
            ></textarea>
            <div className="flex items-center justify-between mt-2">
              <div className="flex space-x-2"></div>
              <button
                onClick={handComment}
                className=" text[#eee] p-2 rounded-sm hover:bg-[#3d3d3d]"
              >
                <FiSend className="text-2xl" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={handleLogin}
          className="text-center hover:underline hover:cursor-pointer"
        >
          Vui lòng đăng nhập để bình luận
        </div>
      )}
      {/* <div className="flex items-start space-x-3">
        <img
          src="https://noithatbinhminh.com.vn/wp-content/uploads/2022/08/anh-dep-44.jpg.webp"
          alt="Gianni Meini"
          className="w-10 h-10 rounded-full"
        />
        <div>
          <div className="flex items-center">
            <span className="font-medium">Gianni Meini</span>
            <span className="text-xs text-gray-400 ml-2">2024-09-23 14:07</span>
          </div>
          <p className="text-sm">Bravo Gue</p>
        </div>
      </div>
      <div className="flex items-start space-x-3 pl-8">
        <img
          src="https://noithatbinhminh.com.vn/wp-content/uploads/2022/08/anh-dep-44.jpg.webp"
          alt="GueM"
          className="w-10 h-10 rounded-full"
        />
        <div>
          <div className="flex items-center">
            <span className="font-medium">GueM</span>
            <span className="text-xs text-gray-400 ml-2">
              Yesterday at 14:55
            </span>
          </div>
          <p className="text-sm">Grazie !!</p>
        </div>
      </div>
      <div className="flex items-start space-x-3">
        <img
          src="https://noithatbinhminh.com.vn/wp-content/uploads/2022/08/anh-dep-44.jpg.webp"
          alt="Gianni Meini"
          className="w-10 h-10 rounded-full"
        />
        <div>
          <div className="flex items-center">
            <span className="font-medium">Gianni Meini</span>
            <span className="text-xs text-gray-400 ml-2">2024-09-23 14:06</span>
          </div>
          <p className="text-sm">Congrats, gorgeous image!</p>
        </div>
      </div> */}
    </div>
  );
}
