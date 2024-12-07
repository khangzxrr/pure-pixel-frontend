import * as exifr from "exifr";
import { notificationApi } from "../Notification/Notification";

// Define EXIF parsing options
const exifOptions = {
  tiff: true, // Parse TIFF data
  ifd0: false, // Disable IFD0
  exif: true, // Enable EXIF data
  gps: true, // Disable GPS data
  interop: false, // Disable Interop data
  ifd1: false, // Disable IFD1 (Thumbnail)
  makerNote: false, // Disable MakerNote
  userComment: false, // Disable UserComment
  xmp: false, // Disable XMP data
  icc: false, // Disable ICC data
  iptc: false, // Disable IPTC data
  jif: false, // Disable JFIF parsing (JPEG)
  ihdr: false, // Disable PNG IHDR parsing
  mergeOutput: true, // Merge all output into one object
  sanitize: true, // Sanitize output (remove untrusted data)
  reviveValues: true, // Revive complex values like Date objects
  translateKeys: true, // Translate keys from technical names to readable ones
  translateValues: true, // Translate values into readable formats
  multiSegment: false, // Disable multi-segment parsing for XMP extended
};

// Function to extract EXIF data from a file (returns a Promise)

const getExifData = async (file) => {
  console.log("getExifData called with file:", file);

  try {
    // Ensure the file type is supported before parsing
    if (file.type !== "image/jpeg" && file.type !== "image/png") {
      console.error("Unsupported file type:", file.type);
      throw new Error(
        "Unsupported file format. Only JPEG and PNG are supported."
      );
    }

    // Attempt to parse EXIF data
    const exifData = await exifr.parse(file, exifOptions);
    console.log("EXIF data parsed successfully:", exifData);

    return exifData;
  } catch (error) {
    console.log("Error stack:", error.stack);
    if (error.message === "Unknown file format") {
      notificationApi(
        "error",
        "Tải ảnh lên thất bại",
        "Ảnh bạn chọn không phải ảnh gốc hợp lệ",
        "",
        0,
        "upload-photo-dragger-error"
      );

      return false;
    }
    return null;
  }
};

const validateExifData = (exifData) => {
  // Required EXIF fields
  const requiredFields = [
    "Model",
    "ISO",
    "FNumber",
    "ShutterSpeedValue",
    "ApertureValue",
  ];

  // Count the number of missing required fields
  let missingCount = 0;

  for (const field of requiredFields) {
    if (!exifData[field]) {
      missingCount++;
    }
  }

  // Return false if more than 2 fields are missing
  return missingCount <= 2;
};

const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    // Return the promise
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const getBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => {
      // Convert ArrayBuffer to buffer in browsers
      const buffer = new Uint8Array(reader.result);
      resolve(buffer);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Utility to convert file to Blob URL for preview
const convertArrayBufferToObjectUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => {
      const blob = new Blob([reader.result], { type: file.type });
      const url = URL.createObjectURL(blob);
      resolve(url);
    };
    reader.onerror = (error) => reject(error);
  });
};

const PhotoService = {
  getExifData,
  validateExifData,
  getBase64,
  getBuffer,
  convertArrayBufferToObjectUrl,
};

export default PhotoService;
