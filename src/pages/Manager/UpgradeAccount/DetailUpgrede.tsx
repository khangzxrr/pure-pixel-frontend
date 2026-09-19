import type { UpgradeRow } from "./TableUpgrade";

function formatCurrency(number: unknown) {
  // Sử dụng hàm toLocaleString() để định dạng số thành chuỗi với ngăn cách hàng nghìn và mặc định là USD.
  if (typeof number === "number") {
    return number.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  }
}

type DetailUpgredeProps = {
  selectedUpgrede: Partial<UpgradeRow>;
};

export default function DetailUpgrede({ selectedUpgrede }: DetailUpgredeProps) {
  return (
    <div>
      <div className="bg-white">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Chi tiết gói Nâng cấp
        </h2>
        <table className="w-full">
          <tbody>
            {/* Tên gói */}
            <tr className="border-b">
              <td className="px-4 py-2 text-gray-600 font-medium">Tên gói:</td>
              <td className="px-4 py-2">{selectedUpgrede?.name}</td>
            </tr>

            {/* Thời hạn */}
            <tr className="border-b">
              <td className="px-4 py-2 text-gray-600 font-medium">Thời hạn:</td>
              <td className="px-4 py-2">
                {selectedUpgrede?.minOrderMonth === 3
                  ? "3 tháng"
                  : selectedUpgrede?.minOrderMonth === 6
                    ? "6 tháng"
                    : "1 năm"}
              </td>
            </tr>

            {/* Số tiền */}
            <tr className="border-b">
              <td className="px-4 py-2 text-gray-600 font-medium">Số tiền:</td>
              <td className="px-4 py-2">
                {formatCurrency(selectedUpgrede?.price)}
              </td>
            </tr>

            {/* Số lượng gói dịch vụ tối đa */}
            <tr className="border-b">
              <td className="px-4 py-2 text-gray-600 font-medium">
                Số lượng gói dịch vụ tối đa:
              </td>
              <td className="px-4 py-2">{selectedUpgrede?.maxPackageCount}</td>
            </tr>

            {/* Max photo quota */}
            <tr className="border-b">
              <td className="px-4 py-2 text-gray-600 font-medium">
                Max Photo Quota:
              </td>
              <td className="px-4 py-2">{selectedUpgrede?.maxPhotoQuota}</td>
            </tr>

            {/* Tóm tắt về gói */}
            <tr className="border-b">
              <td className="px-4 py-2 text-gray-600 font-medium">
                Tóm tắt về gói:
              </td>
              <td className="px-4 py-2">{selectedUpgrede?.summary}</td>
            </tr>

            {/* Mô tả chi tiết các gói (mỗi dòng là một mô tả) */}
            {selectedUpgrede?.descriptions?.map((description, index) => (
              <tr key={index} className="border-b">
                <td className="px-4 py-2 text-gray-600 font-medium">
                  Chi tiết {index + 1} của gói:
                </td>
                <td className="px-4 py-2">{description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
