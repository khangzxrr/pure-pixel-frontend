import React from "react";
import TopPhotoSellingTable from "./TopPhotoSellingTable";

const TopPhotoSelling = ({ dataLastDays }) => {
  const listPhotoBestSelling = dataLastDays.data.topSelledPhotos;

  return (
    <div className="flex flex-col gap-2">
      <p className="font-bold">Những bức ảnh được bán nhiều nhất</p>
      <TopPhotoSellingTable photoBestSold={listPhotoBestSelling} />
    </div>
  );
};

export default TopPhotoSelling;
