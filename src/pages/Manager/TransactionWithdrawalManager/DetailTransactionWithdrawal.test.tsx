import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test/render";
import DetailTransactionWithdrawal from "./DetailTransactionWithdrawal";
import { user, vnd, withdrawal } from "./withdrawalFixtures.test.data";
import type { WithdrawalTransaction } from "./TableTransactionWithdrawal";

const renderDetail = (selectedData: WithdrawalTransaction) => {
  const onClose = vi.fn();
  const view = renderWithProviders(
    <DetailTransactionWithdrawal selectedData={selectedData} onClose={onClose} />,
  );
  return { ...view, onClose };
};

const valueOf = (label: string) =>
  screen.getByText(label).nextElementSibling?.textContent;

describe("DetailTransactionWithdrawal", () => {
  it("shows the requester, time, amount in VND and bank account", () => {
    renderDetail(withdrawal({ status: "PENDING" }));

    expect(screen.getByText("Chi tiết yêu cầu rút tiền")).toBeInTheDocument();
    expect(screen.getByText("Nguyễn Văn A")).toBeInTheDocument();
    expect(screen.getByAltText("Avatar")).toHaveAttribute(
      "src",
      "https://cdn.test/avatar-a.jpg",
    );
    expect(valueOf("Thời gian yêu cầu:")).toBe("10:30 / 15-09-2026");
    expect(valueOf("Số tiền:")).toBe(vnd(1500000));
    expect(valueOf("Số tiền:")).toMatch(/^1\.500\.000\s₫$/);
    expect(valueOf("Ngân hàng:")).toBe("Vietcombank");
    expect(valueOf("Số tài khoản:")).toBe("0123456789NGUYEN VAN A");
    expect(screen.queryByText("Lý do hủy:")).toBeNull();
    expect(
      screen.queryByText("Yêu cầu này chưa có minh chứng rút tiền"),
    ).toBeNull();
  });

  it("shows the deny reason of a cancelled request and a placeholder avatar", () => {
    const cancelled = withdrawal({ status: "CANCEL", user: user({ avatar: "" }) });
    renderDetail({
      ...cancelled,
      withdrawalTransaction: {
        ...cancelled.withdrawalTransaction!,
        failReason: "Tài khoản giả mạo: sai chủ tài khoản",
      },
    });

    expect(valueOf("Lý do hủy:")).toBe("Tài khoản giả mạo: sai chủ tài khoản");
    expect(screen.getByAltText("Avatar")).toHaveAttribute(
      "src",
      "https://via.placeholder.com/40",
    );
  });

  it("shows the transfer evidence of a successful request", () => {
    const success = withdrawal({ status: "SUCCESS" });
    const { container } = renderDetail({
      ...success,
      withdrawalTransaction: {
        ...success.withdrawalTransaction!,
        successPhotoUrl: "https://cdn.test/evidence.jpg",
      },
    });

    expect(container.querySelector("img.ant-image-img")).toHaveAttribute(
      "src",
      "https://cdn.test/evidence.jpg",
    );
  });

  it("says when a successful request has no evidence, and closes", async () => {
    const { onClose } = renderDetail(
      withdrawal({ status: "SUCCESS", withdrawalTransaction: null }),
    );

    expect(
      screen.getByText("Yêu cầu này chưa có minh chứng rút tiền"),
    ).toBeInTheDocument();
    expect(valueOf("Ngân hàng:")).toBe("");

    await userEvent.click(screen.getByRole("button", { name: "Đóng" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
