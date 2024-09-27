import * as exifr from "exifr";

// Define EXIF parsing options
const exifOptions = {
  tiff: true, // Parse TIFF data
  ifd0: false, // Disable IFD0
  exif: true, // Enable EXIF data
  gps: false, // Disable GPS data
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

export const getExifData = (file) => {
  return new Promise((resolve, reject) => {
    exifr
      .parse(file, exifOptions)
      .then((exifData) => {
        console.log("Full EXIF Data:", exifData);

        // Extract only the specific fields you are interested in
        const specificFields = {
          FNumber: exifData.FNumber,
          Model: exifData.Model,
          ShutterSpeedValue: exifData.ShutterSpeedValue,
          ApertureValue: exifData.ApertureValue,
          ISO: exifData.ISO,
        };

        console.log("Filtered EXIF Data:", specificFields);

        resolve(specificFields); // Resolve the promise with only the specific fields
      })
      .catch((error) => {
        reject(error); // Reject the promise if there's an error
      });
  });
};

export const validateExifData = (exifData) => {
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

export const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    // Return the promise
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};
export const getBuffer = (file) => {
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
export const getFileBlobUrl = (file) => {
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
