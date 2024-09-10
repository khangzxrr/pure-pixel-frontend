import React from "react";
import ExplorePhotos from "./ExplorePhotos";
import PhotoCards from "./PhotoCards";
import FeaturedGalleriesComp from "./FeaturedGalleriesComp";
import FeaturedPhotographersComp from "./FeaturedPhotographersComp";
import TopCategories from "./TopCategories";

const Explore = () => {
  return (
    <div className="flex flex-col gap-5 mx-[72px] my-3">
      <ExplorePhotos
        title="Ảnh phổ biến"
        description="Các nội dung mới tải lên có xếp hạng Pure cao nhất"
        linkText="Xem tất cả"
        PhotoCardsComponent={PhotoCards}
      />
      <ExplorePhotos
        title="Lựa chọn của biên tập viên"
        description="Ảnh được nhóm PurePixel lựa chọn"
        linkText="Xem tất cả"
        PhotoCardsComponent={PhotoCards}
      />
      <div>
        <ExplorePhotos
          title="Bộ sưu tập nổi bật"
          description="Bộ sưu tập ảnh được cộng đồng PurePixel tuyển chọn"
          linkText="Xem tất cả"
        />
        <FeaturedGalleriesComp />
      </div>
      <ExplorePhotos
        title="Ảnh sắp tới"
        description="Ảnh có xếp hạng PurePixel tăng dần"
        linkText="Xem tất cả"
        PhotoCardsComponent={PhotoCards}
      />
      <ExplorePhotos
        title="Ảnh mới"
        description="Hãy là một trong những người đầu tiên khám phá những bức ảnh vừa được thêm vào PurePixel"
        linkText="Xem tất cả"
        PhotoCardsComponent={PhotoCards}
      />
      <ExplorePhotos
        title="Các danh mục hàng đầu"
        description="Các danh mục này được sắp xếp theo mức độ phổ biến"
        linkText="Xem tất cả"
        PhotoCardsComponent={TopCategories}
      />
      <div>
        <ExplorePhotos
          title="Nhiếp ảnh gia nổi bật"
          description="Các nhiếp ảnh gia mà chúng tôi nghĩ bạn nên xem"
          linkText="Xem tất cả"
        />
        <FeaturedPhotographersComp />
      </div>
    </div>
  );
};

export default Explore;
