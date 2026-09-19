import type { ServicePackageRow } from "./TableServicePackage";
import {
  requestedAt,
  user,
} from "../TransactionWithdrawalManager/withdrawalFixtures.test.data";

export const servicePackage = (
  overrides: Partial<ServicePackageRow> = {},
): ServicePackageRow => ({
  id: "sp1",
  title: "Chụp cưới",
  subtitle: "",
  price: 5000000,
  thumbnail: "https://cdn.test/sp1.jpg",
  description: "<p>Trọn gói <b>ngày cưới</b></p>",
  status: "ENABLED",
  user: user(),
  reviews: [],
  showcases: [],
  createdAt: requestedAt,
  ...overrides,
});
