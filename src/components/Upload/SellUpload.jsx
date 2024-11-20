import React, { useState, useRef, useEffect } from "react";
import { Button, message, Steps, theme } from "antd";
import { postData, getData } from "../../apis/api";
import { useNavigate } from "react-router-dom";

function formatCurrency(number) {
  if (typeof number === "number") {
    return number.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  } else if (typeof number === "string" && !isNaN(Number(number))) {
    return Number(number).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  } else {
    return number;
  }
}

const SellUpload = () => {
  const { token } = theme.useToken();
  const [current, setCurrent] = useState(0);
  const [images, setImages] = useState([]);
  const [imageData, setImageData] = useState([]);
  const fileInputRef = useRef(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (current === 1 && currentImageIndex === null && imageData.length > 0) {
      setCurrentImageIndex(0);
    }
  }, [current, currentImageIndex, imageData.length]);

  const handleFileChange = (e) => {
    const files = Array.from(e?.target?.files);
    setImages((prevImages) => [...prevImages, ...files]);
    const newImageData = files.map((file) => ({
      file,
      info: "",
      sizes: [],
      qualities: [],
      id: null,
      title: "", // Thêm trường title
    }));
    setImageData((prevData) => [...prevData, ...newImageData]);
  };

  const handleRemove = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setImageData((prevData) => prevData.filter((_, i) => i !== index));
    if (index === currentImageIndex) {
      setCurrentImageIndex(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e?.dataTransfer?.files).filter((file) =>
      file.type.startsWith("image/")
    );
    setImages((prevImages) => [...prevImages, ...files]);
    const newImageData = files.map((file) => ({
      file,
      info: "",
      sizes: [],
      qualities: [],
      id: null,
      title: "", // Thêm trường title
    }));
    setImageData((prevData) => [...prevData, ...newImageData]);
  };

  const uploading = () => {
    const newImageData = [...imageData];
    let uploadCount = 0;

    for (let index = 0; index < imageData.length; index++) {
      const element = imageData[index];
      const formData = new FormData();
      formData.append("file", element?.file);

      postData("/photo/upload", formData)
        .then((data) => {
          console.log(data);
          getData(`/photo/${data.id}/available-resolution`)
            .then((resolutions) => {
              console.log(resolutions);
              const sizeArray = resolutions.data || resolutions;
              newImageData[index] = {
                ...element,
                id: data.id,
                sizes: sizeArray,
                qualities: sizeArray.map((size) => ({
                  size: size,
                  price: "",
                })),
              };
              uploadCount++;
              if (uploadCount === imageData.length) {
                setImageData(newImageData);
                setCurrent(current + 1);
              }
            })
            .catch((error) => {
              console.log(error);
              message.error(
                `Lỗi khi lấy kích thước ảnh cho hình ảnh ${element?.file.name}`
              );
            });
        })
        .catch((error) => {
          console.log(error);
          message.error(`Lỗi khi tải lên hình ảnh ${element?.file.name}`);
        });
    }
  };

  const next = () => {
    if (current === 0) {
      if (images.length === 0) {
        message.error("Vui lòng tải lên ít nhất một hình ảnh.");
        return;
      }
      uploading();
    } else if (current === 1) {
      const allDataFilled = imageData.every(
        (data) =>
          data.title &&
          data.info &&
          data.qualities.every((q) => q.price && q.price > 1000)
      );
      if (!allDataFilled) {
        message.error(
          "Vui lòng nhập đầy đủ thông tin và giá tiền phải lớn hơn 1000 cho tất cả các hình ảnh."
        );
        return;
      }
      setCurrent(current + 1);
    } else {
      setCurrent(current + 1);
    }
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const submitData = () => {
    let submitCount = 0;
    for (let index = 0; index < imageData.length; index++) {
      const data = imageData[index];
      const payload = {
        title: data.title,
        description: data.info,
        pricetags: data.qualities.map((item) => ({
          size: item.size,
          price: item.price,
        })),
      };
      console.log("Payload:", payload);

      postData(`/photo/${data.id}/sell`, payload)
        .then((response) => {
          console.log(response);
          submitCount++;
          if (submitCount === imageData.length) {
            message.success("Đã gửi tất cả dữ liệu thành công!");
            setTimeout(() => {
              navigate("/profile/photo-selling");
            }, 2000);
          }
        })
        .catch((error) => {
          console.log(error);
          switch (error.data.message) {
            case "FailToPerformOnDuplicatedPhotoException":
              message.error(
                `Lỗi khi gửi dữ liệu cho hình ảnh ${data?.file.name},Lý do: Hình ảnh bị trùng lập`
              );
              break;

            default:
              break;
          }
        });
    }
  };

  const handleInputChange = (e, field, index) => {
    const newData = [...imageData];
    newData[index][field] = e.target.value;
    setImageData(newData);
  };

  const handlePriceChange = (value, qIndex, index) => {
    const newData = [...imageData];
    newData[index].qualities[qIndex].price = value;
    setImageData(newData);
  };

  const steps = [
    {
      title: "Tải lên hình ảnh",
      content: (
        <div className="mx-auto p-4">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4 text-center"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="fileInput"
              ref={fileInputRef}
            />
            <label
              htmlFor="fileInput"
              className="cursor-pointer text-blue-500 hover:text-blue-600"
            >
              Nhấn để chọn ảnh
            </label>
            <p className="mt-2 text-gray-500">hoặc kéo thả ảnh vào đây</p>
          </div>

          {images.length > 0 && (
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Ảnh đã chọn:</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Ảnh ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleRemove(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-center pb-1"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Nhập thông tin",
      content: (
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {imageData.map((data, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(data.file)}
                  alt={`Ảnh ${index + 1}`}
                  className={`w-full h-32 object-cover rounded-lg cursor-pointer ${
                    currentImageIndex === index
                      ? "border-4 border-blue-500"
                      : ""
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                />
                {data.title &&
                  data.info &&
                  data.qualities.every((q) => q.price && q.price > 1000) && (
                    <div className="absolute top-1 left-1 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-center">
                      ✓
                    </div>
                  )}
              </div>
            ))}
          </div>

          {/* Form for the selected image */}
          {currentImageIndex !== null && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">
                Nhập thông tin cho ảnh {" "}
                {imageData[currentImageIndex]?.file?.name ||
                  currentImageIndex + 1}
              </h3>
              <div className="mb-4">
                <label
                  htmlFor="title"
                  className="block text-white mb-2 font-medium"
                >
                  Tiêu đề
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="w-full bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={imageData[currentImageIndex]?.title}
                  onChange={(e) =>
                    handleInputChange(e, "title", currentImageIndex)
                  }
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="info"
                  className="block text-white mb-2 font-medium"
                >
                  Thông tin
                </label>
                <input
                  type="text"
                  id="info"
                  name="info"
                  className="w-full bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={imageData[currentImageIndex]?.info}
                  onChange={(e) =>
                    handleInputChange(e, "info", currentImageIndex)
                  }
                />
              </div>
              <p className="text-white mb-2">Kích thước và giá:</p>
              {imageData[currentImageIndex]?.qualities.map((quality, qIndex) => (
                <div key={qIndex} className="flex items-center mb-2">
                  <span className="mr-2 text-white">
                    Kích thước {quality.size}
                  </span>
                  <input
                    type="number"
                    min="0"
                    className="w-full bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Giá"
                    value={quality.price}
                    onChange={(e) =>
                      handlePriceChange(
                        e.target.value,
                        qIndex,
                        currentImageIndex
                      )
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Xem lại & Gửi",
      content: (
        <div>
          {imageData.map((data, index) => (
            <div key={index} className="flex items-start mb-7">
              <img
                src={URL.createObjectURL(data.file)}
                alt="Ảnh"
                className="w-[300px] h-32 object-cover rounded-lg cursor-pointer"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">
                  {data.title || data.file.name || `Ảnh ${index + 1}`}
                </h3>
                <p>
                  <strong>Thông tin:</strong> {data.info}
                </p>
                <p>
                  <strong>Kích thước và giá:</strong>
                </p>
                <ul className="list-disc list-inside">
                  {data.qualities.map((item, idx) => (
                    <li key={idx}>
                      Kích thước {item.size}: {formatCurrency(item.price)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  const items = steps.map((item) => ({
    key: item.title,
    title: item.title,
  }));

  const contentStyle = {
    textAlign: "center",
    backgroundColor: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: `1px dashed ${token.colorBorder}`,
    marginTop: 16,
  };

  return (
    <div className="px-3 pt-3 min-h-screen">
      <Steps current={current} items={items} className="custom-steps" />
      <div className="text-white p-4" style={contentStyle}>
        {steps[current].content}
      </div>
      <div className="mt-6">
        {current < steps.length - 1 && (
          <Button type="primary" onClick={next}>
            Tiếp tục
          </Button>
        )}
        {current === steps.length - 1 && (
          <Button type="primary" onClick={submitData}>
            Hoàn thành
          </Button>
        )}
        {current > 0 && (
          <Button className="ml-2" onClick={prev}>
            Quay lại
          </Button>
        )}
      </div>
    </div>
  );
};

export default SellUpload;
