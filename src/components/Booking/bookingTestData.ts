// typed builders for the booking screens' tests
import type { Schema } from "../../apis/types";
import type { PhotoshootPackageItem } from "./BookingPackageCard";
import type { BookingItem } from "./BookingRequestState/BookingCard";

const timestamp = "2026-09-01T03:00:00.000Z";

export const buildUser = (
  overrides: Partial<Schema<"UserDto">> = {},
): Schema<"UserDto"> => ({
  id: "customer-1",
  createdAt: timestamp,
  updatedAt: timestamp,
  roles: [],
  enabled: true,
  username: "khach",
  cover: "",
  location: "",
  mail: "khach@test.vn",
  phonenumber: "",
  socialLinks: [],
  expertises: [],
  avatar: "https://cdn.test/customer.jpg",
  name: "Khách Hàng",
  quote: "",
  ...overrides,
});

export const buildPackage = (
  overrides: Partial<PhotoshootPackageItem> = {},
): PhotoshootPackageItem => ({
  id: "pkg-1",
  title: "Gói cưới",
  subtitle: "Ngoại cảnh",
  price: 1500000,
  thumbnail: "https://cdn.test/pkg.jpg",
  description: "Chụp cả ngày",
  status: "ENABLED",
  user: buildUser({
    id: "photographer-1",
    name: "Nhiếp Ảnh Gia",
    avatar: "https://cdn.test/photographer.jpg",
  }),
  reviews: [],
  showcases: [],
  _count: { bookings: 1234 },
  ...overrides,
});

export const buildBillItem = (
  overrides: Partial<Schema<"BookingBillItemDto">> = {},
): Schema<"BookingBillItemDto"> => ({
  id: "bill-1",
  title: "Trang điểm",
  description: "mô tả thêm",
  price: 200000,
  type: "INCREASE",
  createdAt: timestamp,
  updatedAt: timestamp,
  ...overrides,
});

export const buildSignedPhoto = (
  id: string,
  overrides: Partial<Schema<"SignedPhotoDto">> = {},
): Schema<"SignedPhotoDto"> => ({
  id,
  blurHash: "",
  title: id,
  watermark: false,
  viewCount: 0,
  exif: {},
  description: "",
  width: 1200,
  height: 800,
  photoType: "BOOKING",
  visibility: "PRIVATE",
  status: "PARSED",
  createdAt: timestamp,
  updatedAt: timestamp,
  photographer: {
    deletedAt: null,
    photoCount: 1,
    voteCount: 0,
    normalizedName: "nhiep anh gia",
    mail: "photographer@test.vn",
    phonenumber: "",
    socialLinks: [],
    expertises: [],
    id: "photographer-1",
    name: "Nhiếp Ảnh Gia",
    avatar: "",
    cover: "",
    quote: "",
    location: "",
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  signedUrl: {
    url: `https://cdn.test/${id}.jpg`,
    thumbnail: `https://cdn.test/${id}-thumb.jpg`,
  },
  ...overrides,
});

export const buildBooking = (
  overrides: Partial<BookingItem> = {},
): BookingItem => ({
  id: "booking-1",
  startDate: "2026-09-20T02:00:00.000Z",
  endDate: "2026-09-20T06:00:00.000Z",
  successedAt: null,
  status: "REQUESTED",
  description: "Chụp ở hồ Gươm",
  photoshootPackageHistory: {
    title: "Gói cưới",
    subtitle: "Ngoại cảnh",
    price: 1500000,
    thumbnail: "https://cdn.test/pkg.jpg",
    description: "Chụp cả ngày",
  },
  billItems: [],
  totalBillItem: 1500000,
  user: buildUser(),
  reviews: [],
  createdAt: timestamp,
  updatedAt: timestamp,
  ...overrides,
});
