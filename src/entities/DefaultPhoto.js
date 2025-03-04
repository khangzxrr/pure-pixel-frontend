export default function getDefaultPhoto(photo) {
  return {
    captureTime: photo?.captureTime || "",
    categoryId: photo?.categoryId || "",
    colorGrading: photo?.colorGrading || {},
    createdAt: photo?.createdAt || "",
    description: photo?.description || "",
    exif: photo?.exif || "",
    gps: photo?.gps || {},
    id: photo?.id || "",
    location: photo?.location || "",
    originalPhotoUrl: photo?.originalPhotoUrl || "",
    photoTags: photo?.photoTags || [],
    categoryIds: photo?.categoryIds || [],
    photographerId: photo?.photographerId || "",
    showExif: photo?.showExif || "",
    status: photo?.status || "",
    thumbnailPhotoUrl: photo?.thumbnailPhotoUrl || "",
    title: photo?.title || "",
    updatedAt: photo?.updatedAt || "",
    visibility: photo?.visibility || "",
    watermark: photo?.watermark || false,
    watermarkContent: photo?.watermarkContent || "",
    watermarkPhotoUrl: photo?.watermarkPhotoUrl || "",
    watermarkThumbnailPhotoUrl: photo?.watermarkThumbnailPhotoUrl || "",
    status: photo?.status || "",
    pricetags: photo?.pricetags || [],
  };
}
