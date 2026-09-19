export type DefaultPhoto = {
  captureTime: string;
  categoryId: string;
  colorGrading: Record<string, unknown>;
  createdAt: string;
  description: string;
  exif: Record<string, unknown> | string;
  gps: Record<string, unknown>;
  id: string;
  location: string;
  originalPhotoUrl: string;
  photoTags: unknown[];
  categoryIds: string[];
  photographerId: string;
  showExif: boolean | string;
  status: string;
  thumbnailPhotoUrl: string;
  title: string;
  updatedAt: string;
  visibility: string;
  watermark: boolean;
  watermarkContent: string;
  watermarkPhotoUrl: string;
  watermarkThumbnailPhotoUrl: string;
  pricetags: unknown[];
};

// fills every field a photo form reads, so partially loaded photos render
export default function getDefaultPhoto(
  photo?: Partial<DefaultPhoto> | null,
): DefaultPhoto {
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
    pricetags: photo?.pricetags || [],
  };
}
