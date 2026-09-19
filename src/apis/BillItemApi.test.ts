import { mockEndpoint } from "../test/mockEndpoint";
import BillItemApi from "./BillItemApi";

vi.mock("../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const bill = {
  title: "Thêm giờ",
  description: "mô tả thêm",
  price: 50000,
  type: "INCREASE" as const,
};

describe("BillItemApi", () => {
  it("getBillItems requests the first page of the booking bill", async () => {
    const requests = mockEndpoint(
      "get",
      "*/photographer/booking/b1/bill-item",
      { objects: [{ id: "i1" }], totalPage: 1 },
    );

    await expect(BillItemApi.getBillItems("b1")).resolves.toEqual({
      objects: [{ id: "i1" }],
      totalPage: 1,
    });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        path: "/photographer/booking/b1/bill-item",
        query: { limit: "10", page: "0" },
      }),
    ]);
  });

  it("addBillItem posts only the bill fields and returns the whole response", async () => {
    const requests = mockEndpoint(
      "post",
      "*/photographer/booking/b1/bill-item",
      { id: "i1" },
    );
    const input = { ...bill, extra: "ignored" };

    const response = await BillItemApi.addBillItem("b1", input);

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ id: "i1" });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "POST",
        path: "/photographer/booking/b1/bill-item",
        json: bill,
      }),
    ]);
  });

  it("updateBillItem patches the bill item and returns the whole response", async () => {
    const requests = mockEndpoint(
      "patch",
      "*/photographer/booking/b1/bill-item/i1",
      { id: "i1", price: 70000 },
    );

    const response = await BillItemApi.updateBillItem("b1", "i1", {
      price: 70000,
    });

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ id: "i1", price: 70000 });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "PATCH",
        path: "/photographer/booking/b1/bill-item/i1",
        json: { price: 70000 },
      }),
    ]);
  });

  it("deleteBillItem deletes the bill item and returns the body", async () => {
    const requests = mockEndpoint(
      "delete",
      "*/photographer/booking/b1/bill-item/i1",
      { id: "i1" },
    );

    await expect(BillItemApi.deleteBillItem("b1", "i1")).resolves.toEqual({
      id: "i1",
    });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "DELETE",
        path: "/photographer/booking/b1/bill-item/i1",
      }),
    ]);
  });
});
