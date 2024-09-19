import React from "react";

const ExifDetail = ({ exif, showMore }) => {
  const details = [
    { key: "ISO", value: exif.ISO },
    { key: "Make", value: exif.Make },
    { key: "Flash", value: exif.Flash },
    { key: "FNumber", value: exif.FNumber },
    { key: "Software", value: exif.Software },
    { key: "ApertureValue", value: exif.ApertureValue },
    { key: "ColorSpace", value: exif.ColorSpace },
    { key: "ExifVersion", value: exif.ExifVersion },
    { key: "FocalLength", value: exif.FocalLength },
    { key: "Orientation", value: exif.Orientation },
    { key: "XResolution", value: exif.XResolution },
    { key: "YResolution", value: exif.YResolution },
    { key: "ExposureTime", value: exif.ExposureTime },
    ...(showMore
      ? [
          { key: "MeteringMode", value: exif.MeteringMode },
          { key: "WhiteBalance", value: exif.WhiteBalance },
          { key: "Latitude", value: exif.latitude },
          { key: "Longitude", value: exif.longitude },
          { key: "ExifImageWidth", value: exif.ExifImageWidth },
          { key: "GPSLatitudeRef", value: exif.GPSLatitudeRef },
          { key: "ResolutionUnit", value: exif.ResolutionUnit },
          { key: "ExifImageHeight", value: exif.ExifImageHeight },
          { key: "ExposureProgram", value: exif.ExposureProgram },
          { key: "FlashpixVersion", value: exif.FlashpixVersion },
          { key: "DateTimeOriginal", value: exif.DateTimeOriginal },
        ]
      : []),
  ];

  // Kiểm tra xem có bất kỳ giá trị nào không phải là undefined, null hoặc rỗng không
  const hasAnyDetail = details.some((detail) => detail.value);

  return (
    <ul>
      {hasAnyDetail ? (
        details.map(
          (detail, index) =>
            detail.value && (
              <li key={index}>
                <strong>{detail.key}:</strong> {detail.value}
              </li>
            )
        )
      ) : (
        <li>
          <strong>Thông số:</strong> Không xác định
        </li>
      )}
    </ul>
  );
};

export default ExifDetail;
