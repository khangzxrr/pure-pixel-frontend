import React, { useEffect, useState } from "react";
import { getData } from "../../apis/api";
import ComDateConverter from "../ComDateConverter/ComDateConverter";

export default function CommentPhoto({ id }) {
  const [dataComment, setDataComment] = useState([]);
  useEffect(() => {
    getData(`photo/${id}/comment`)
      .then((e) => {
          setDataComment(e.data);
          
      })
      .catch((error) => {
        console.log(error);
      });
  }, [id]);
console.log(dataComment);

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
            <div className="flex items-center">
              <span className="font-medium">{value?.user?.name}</span>
              <span className="text-xs text-gray-400 ml-2">
                <ComDateConverter>{value?.createdAt}</ComDateConverter>
              </span>
            </div>
            <p className="text-sm">{value?.content}</p>
          </div>
        </div>
      ))}
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
