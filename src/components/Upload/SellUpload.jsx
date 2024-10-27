import React, { useState, useRef } from "react";
import { Button, message, Steps, Form, InputNumber, Input, theme } from "antd";
import { postData, getData } from "../../apis/api";

const SellUpload = () => {
  const { token } = theme.useToken();
  const [current, setCurrent] = useState(0);
  const [images, setImages] = useState([]);
  const [imageData, setImageData] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    // Thêm các tệp mới vào danh sách images hiện có
    setImages((prevImages) => [...prevImages, ...files]);
    // Khởi tạo imageData với các tệp mới
    const newImageData = files.map((file) => ({
      file,
      info: "",
      sizes: [],
      qualities: [],
      id: null,
    }));
    setImageData((prevData) => [...prevData, ...newImageData]);
  };

  const handleRemove = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setImageData((prevData) => prevData.filter((_, i) => i !== index));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    setImages((prevImages) => [...prevImages, ...files]);
    // Khởi tạo imageData với các tệp mới
    const newImageData = files.map((file) => ({
      file,
      info: "",
      sizes: [],
      qualities: [],
      id: null,
    }));
    setImageData((prevData) => [...prevData, ...newImageData]);
  };

  const uploading = () => {
    const newImageData = [...imageData];
    let uploadCount = 0;

    for (let index = 0; index < imageData.length; index++) {
      const element = imageData[index];
      const formData = new FormData();
      formData.append("file", element.file);

      postData("/photo/upload", formData)
        .then((data) => {
          console.log(data);
          getData(`/photo/${data.id}/available-resolution`)
            .then((resolutions) => {
              console.log(resolutions);
              // Kiểm tra và lấy dữ liệu từ resolutions
              const sizeArray = resolutions.data || resolutions;
              // Cập nhật sizes, qualities và id cho element
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
              // Kiểm tra nếu tất cả các ảnh đã được xử lý
              if (uploadCount === imageData.length) {
                setImageData(newImageData);
                setCurrent(current + 1);
              }
            })
            .catch((error) => {
              console.log(error);
              message.error(
                `Lỗi khi lấy kích thước ảnh cho hình ảnh ${element.file.name}`
              );
            });
        })
        .catch((error) => {
          console.log(error);
          message.error(`Lỗi khi tải lên hình ảnh ${element.file.name}`);
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
    } else {
      setCurrent(current + 1);
    }
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const submitData = () => {
    // Gửi dữ liệu lên API /photo/{id}/sell cho mỗi hình ảnh
    let submitCount = 0;
    for (let index = 0; index < imageData.length; index++) {
      const data = imageData[index];
      const payload = {
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
            // Bạn có thể điều hướng hoặc thực hiện hành động khác tại đây
          }
        })
        .catch((error) => {
          console.log(error);
          message.error(`Lỗi khi gửi dữ liệu cho hình ảnh ${data.file.name}`);
        });
    }
  };

  const handleFormChange = (changedValues, allValues, index) => {
    const newData = [...imageData];
    // Cập nhật info
    if (changedValues.info !== undefined) {
      newData[index].info = allValues.info;
    }
    // Cập nhật qualities
    if (changedValues.qualities !== undefined) {
      const updatedQualities = newData[index].qualities.map(
        (quality, qIndex) => {
          const newPrice =
            allValues.qualities &&
            allValues.qualities[qIndex] &&
            allValues.qualities[qIndex].price;
          return {
            ...quality,
            price: newPrice !== undefined ? newPrice : quality.price,
          };
        }
      );
      newData[index].qualities = updatedQualities;
    }
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
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 text-white">
          {imageData.map((data, index) => (
            <div key={index} className="mb-5">
              <img
                src={URL.createObjectURL(data.file)}
                alt="Ảnh"
                className="w-36 h-36 mb-4 object-cover"
              />
              <Form
                className="text-white"
                layout="vertical"
                initialValues={{
                  info: data.info,
                  qualities: data.qualities,
                }}
                onValuesChange={(changedValues, allValues) =>
                  handleFormChange(changedValues, allValues, index)
                }
              >
                <h3 className="text-lg font-semibold">
                  {data.file.name || `Ảnh ${index + 1}`}
                </h3>
                <Form.Item
                  label="Thông tin"
                  name="info"
                  rules={[
                    { required: true, message: "Vui lòng nhập thông tin!" },
                  ]}
                >
                  <Input />
                </Form.Item>
                <p>Kích thước và giá:</p>
                {data.qualities.map((quality, qIndex) => (
                  <div key={qIndex} className="flex items-center mb-2">
                    <span className="mr-2">Kích thước {quality.size}</span>
                    <Form.Item
                      name={["qualities", qIndex, "price"]}
                      rules={[{ required: true, message: "Nhập giá" }]}
                      className="flex-1 mr-2"
                    >
                      <InputNumber placeholder="Giá" className="w-full" />
                    </Form.Item>
                  </div>
                ))}
              </Form>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Xem lại & Gửi",
      content: (
        <div>
          {imageData.map((data, index) => (
            <div key={index} className="flex items-start mb-5">
              <img
                src={URL.createObjectURL(data.file)}
                alt="Ảnh"
                className="w-36 h-36 mr-5 object-cover"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">
                  {data.file.name || `Ảnh ${index + 1}`}
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
                      Kích thước {item.size}: {item.price}
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
