import { HttpResponse } from "msw";
import { mockEndpoint } from "../test/mockEndpoint";
import ManageTracsaction from "./ManageTransaction";

vi.mock("../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const emptyOk = () => new HttpResponse(null, { status: 200 });

describe("ManageTransaction", () => {
  it("acceptWithdrawal uploads the evidence photo as multipart", async () => {
    const requests = mockEndpoint(
      "patch",
      "*/manager/transaction/t1/withdrawal/accept",
      emptyOk,
    );
    const photo = new File(["img"], "evidence.jpg", { type: "image/jpeg" });

    await expect(
      ManageTracsaction.acceptWithdrawal("t1", photo),
    ).resolves.toBe("");

    expect(requests).toHaveLength(1);
    expect(requests[0].method).toBe("PATCH");
    expect(requests[0].path).toBe("/manager/transaction/t1/withdrawal/accept");
    expect((requests[0].form?.get("photo") as File).name).toBe("evidence.jpg");
  });

  it("denyWithdrawal sends the reason", async () => {
    const requests = mockEndpoint(
      "patch",
      "*/manager/transaction/t1/withdrawal/deny",
      emptyOk,
    );

    await expect(
      ManageTracsaction.denyWithdrawal("t1", "Sai số tài khoản"),
    ).resolves.toBe("");
    expect(requests).toEqual([
      expect.objectContaining({
        method: "PATCH",
        path: "/manager/transaction/t1/withdrawal/deny",
        json: { failReason: "Sai số tài khoản" },
      }),
    ]);
  });
});
