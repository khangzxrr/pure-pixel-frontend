import type { Schema } from "../../../apis/types";

// 15/09/2026 10:30 local time
export const createdAt = new Date(2026, 8, 15, 10, 30).toISOString();

export const photographer = (
  overrides: Partial<Schema<"PhotographerDTO">> = {},
): Schema<"PhotographerDTO"> => ({
  deletedAt: null,
  photoCount: 0,
  voteCount: 0,
  normalizedName: "",
  mail: "",
  phonenumber: "",
  socialLinks: [],
  expertises: [],
  id: "pg1",
  name: "Nguyễn Văn A",
  avatar: "https://cdn.test/pg-a.jpg",
  cover: "",
  quote: "",
  location: "",
  createdAt,
  updatedAt: createdAt,
  ...overrides,
});

export const photo = (
  overrides: Partial<Schema<"SignedPhotoDto">> = {},
): Schema<"SignedPhotoDto"> => ({
  id: "p1",
  blurHash: "",
  title: "Hoàng hôn",
  watermark: false,
  viewCount: 0,
  exif: {},
  description: "Biển Vũng Tàu",
  width: 100,
  height: 100,
  photoType: "RAW",
  visibility: "PUBLIC",
  status: "PARSED",
  createdAt,
  updatedAt: createdAt,
  photographer: photographer(),
  signedUrl: {
    url: "https://cdn.test/p1.jpg",
    thumbnail: "https://cdn.test/p1-thumb.jpg",
  },
  ...overrides,
});

export const list = <T>(objects: T[], totalRecord = objects.length) => ({
  objects,
  totalRecord,
  totalPage: 1,
});
