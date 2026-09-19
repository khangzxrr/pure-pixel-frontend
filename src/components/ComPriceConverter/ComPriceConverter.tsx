type ComPriceConverterProps = {
  // amount in VND; anything else renders nothing
  children?: number;
};

function ComPriceConverter({ children }: ComPriceConverterProps) {
  function formatCurrency(number: unknown) {
    // Sử dụng hàm toLocaleString() để định dạng số thành chuỗi với ngăn cách hàng nghìn và mặc định là USD.
    if (typeof number === "number") {
      return number.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      });
    }
  }

  const formattedDate = formatCurrency(children);
  return <>{formattedDate}</>;
}

export default ComPriceConverter;
