import { Image } from "antd";
import React, { useState } from "react";
import { getData } from "../../apis/api";

function ComUserIdConverter({ children }) {
  const [data, setData] = useState({})
    const reloadData = () => {
 
      getData(`/user/${children}`)
        .then((e) => {
          setData(e?.data?.objects);
          console.log("====================================");
          console.log(e?.data);
          console.log("====================================");
        })
        .catch((error) => {
          console.error("Error fetching items:", error);
          if (error?.status === 401) {
            reloadData();
          }
        });
    };
  useEffect(() => {
      
    }, [children]);

  return (
    <>
      <div className="w-20 h-20 flex items-center justify-center overflow-hidden">
        <Image
          wrapperClassName=" w-full h-full object-cover object-center flex items-center justify-center "
          src={data?.photo?.signedUrl?.thumbnail}
          alt={data?.photo?.signedUrl?.thumbnail}
          preview={{ mask: "Xem ảnh" }}
        />
      </div>
    </>
  );
}

export default ComUserIdConverter;
