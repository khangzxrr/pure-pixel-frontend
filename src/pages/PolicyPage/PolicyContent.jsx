import React from "react";

const PolicyContent = () => {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-center">
        <h1 className="text-2xl font-bold">
          <i>ĐIỀU KHOẢN SỬ DỤNG</i>
        </h1>
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Giới thiệu</h2>
        <li className="font-normal">
          Tài liệu dưới đây nêu chi tiết các điều khoản sử dụng của trang web
          Pure Pixel. Trước khi sử dụng bất kỳ dịch vụ nào của Pure Pixel, bạn
          phải đọc, hiểu và đồng ý với các điều khoản này.{" "}
        </li>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold">Tạo tài khoản và xác thực</h3>
        <div className="font-normal">
          <li>
            Mỗi tài khoản mới phải có tên người dùng và địa chỉ email duy nhất.
            Không được phép tạo tài khoản trùng lặp.
          </li>
          <li>
            Mật khẩu phải đáp ứng tiêu chuẩn bảo mật tối thiểu, bao gồm ít nhất
            8 ký tự với ít nhất một chữ cái viết hoa, một chữ cái thường, một
            chữ số và một ký tự đặc biệt.
          </li>
          <li>Các tài khoản bị cấm không thể đăng nhập vào nền tảng.</li>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold">
          Quy định về nội dung và tải ảnh lên
        </h3>
        <div className="font-normal">
          <li>
            Chỉ chấp nhận các định dạng ảnh JPG, JPEG, và PNG. Ảnh phải chứa dữ
            liệu EXIF (model, maker, lens...) và không được trùng lặp
          </li>
          <li>
            Chỉ những người dùng có vai trò nhiếp ảnh gia mới có thể tải ảnh lên
            nền tảng.
          </li>
          <li>
            Người dùng không được phép đăng ảnh không thuộc bản quyền của mình.
          </li>
          <li>Không được đăng ảnh không phù hợp với thuần phong mỹ tục.</li>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold">
          Bản quyền và xử lý vi phạm bản quyền
        </h3>
        <div className="flex flex-col gap-1">
          <h4 className="font-bold">Quy định về bản quyền</h4>
          <li className="font-normal">
            Người dùng chịu trách nhiệm hoàn toàn với tất cả nội dung mà họ tải
            lên nền tảng. Người dùng không được phép tải lên, chia sẻ hoặc bán
            các bức ảnh không thuộc quyền sở hữu hoặc không có quyền sử dụng hợp
            pháp.
          </li>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="font-bold">Xử lý vi phạm bản quyền</h4>
          <div className="flex flex-col gap-1">
            <h4 className="font-semibold">1. Nhận báo cáo vi phạm bản quyền</h4>
            <li className="font-normal">
              Nếu một bên thứ ba báo cáo rằng ảnh được tải lên trên nền tảng vi
              phạm quyền sở hữu trí tuệ của họ, họ cần cung cấp đầy đủ bằng
              chứng theo pháp luật Việt Nam.
            </li>
          </div>
          <div className="flex flex-col gap-1">
            <h4 className="font-semibold">2. Quyết định xử lý</h4>
            <li className="font-normal">
              Nếu người báo cáo cung cấp đủ bằng chứng và người vi phạm không
              phản biện được, Pure Pixel sẽ hỗ trợ giải quyết bằng biện pháp
            </li>
            <li className="font-normal">Ảnh sẽ bị khóa trên nền tảng.</li>
            <li className="font-normal">
              Tài khoản của người vi phạm sẽ bị khóa hoặc cấm.
            </li>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold">Lợi nhuận bán ảnh</h3>
        <div className="font-normal">
          <li>
            Hoa hồng cho việc bán ảnh qua nền tảng là 10%, đồng nghĩa nhiếp ảnh
            gia sẽ nhận được 90% số tiền bán ảnh.
          </li>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold">Đặt lịch chụp ảnh</h3>
        <div className="font-normal">
          <li>
            Đặt lịch chụp phải cách ít nhất 24 giờ kể từ ngày hiện tại và không
            được trùng với lịch đặt trước đó. Thời gian đặt lịch không vượt quá
            3 tháng kể từ ngày hiện tại.
          </li>
          <li>
            Nhiếp ảnh gia không được phép đặt lịch chụp ảnh của chính mình.
          </li>
          <li>
            Với buổi chụp hoàn thành, nhiếp ảnh gia sẽ được xóa ảnh sau 30 ngày.
          </li>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold">Xử lý rút tiền</h3>
        <div className="font-normal">
          <li>Yêu cầu rút tiền sẽ được xử lý trong vòng 3 ngày.</li>
          <li>
            Khi người dùng yêu cầu rút tiền, ngay lập tức số tiền cần rút sẽ
            được trừ khỏi ví của người dùng. Nền tảng sẽ tạm giữ số tiền này để
            xử lý yêu cầu rút tiền.
          </li>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold">Quy định chung</h3>
        <div className="font-normal">
          <li>
            Người dùng chịu trách nhiệm cho mọi hành vi trên nền tảng, và các
            tranh chấp sẽ được xử lý theo luật pháp Việt Nam.
          </li>
          <li>
            Pure Pixel có quyền ngừng cung cấp dịch vụ hoặc khóa tài khoản bất
            kỳ lúc nào nếu phát hiện hành vi vi phạm.
          </li>
        </div>
      </div>
      <div className="h-[100px] ">
        <div className="font-bold">Liên hệ với chúng tôi thông qua:</div> Email:{" "}
        <a
          className="font-normal text-blue-500 cursor-pointer hover:underline"
          href="mailto:purepixel.io.vn@gmail.com"
        >
          purepixel.io.vn@gmail.com
        </a>
      </div>
    </div>
  );
};

export default PolicyContent;
