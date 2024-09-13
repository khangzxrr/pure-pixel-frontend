import React, { useState } from "react";
import PhotographerCard from "./PhotographerCard";
import InfiniteScroll from "react-infinite-scroll-component";
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner";

const Following = () => {
  const [photographers, setPhotographers] = useState([...Array(10)]);
  const [hasMore, setHasMore] = useState(true);

  const fetchMoreData = () => {
    if (photographers.length >= 50) {
      setHasMore(false);
      return;
    }
    setTimeout(() => {
      setPhotographers((prev) => [...prev, ...Array(5)]);
    }, 1500);
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col justify-center items-center gap-1 py-5">
        <div className="text-xl font-bold">Bạn chưa theo dõi ai cả</div>
        <div>
          Bắt đầu theo dõi các nhiếp ảnh gia và cập nhật những bức ảnh mới nhất
          của họ tại đây!
        </div>
      </div>
      {photographers.length === 0 ? (
        <div>Không thể tải danh sách đang theo dõi</div>
      ) : (
        <InfiniteScroll
          dataLength={photographers.length}
          next={fetchMoreData}
          hasMore={hasMore}
          loader={<LoadingSpinner />}
          endMessage={
            <p style={{ textAlign: "center" }}>
              <b>Bạn đã xem hết tất cả các nhiếp ảnh gia</b>
            </p>
          }
          className="flex flex-wrap gap-7 px-4 py-3 justify-center"
        >
          {photographers.map((_, index) => (
            <PhotographerCard key={index} />
          ))}
        </InfiniteScroll>
      )}
    </div>
  );
};

export default Following;
