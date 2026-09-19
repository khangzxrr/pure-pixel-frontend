import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/render";
import UpdateUserDetail from "./UpdateUserDetail";

const updateUserMock = vi.hoisted(() => vi.fn());

vi.mock("../../apis/AdminApi", () => ({
  default: {
    updateUser: (...args: unknown[]) => updateUserMock(...args),
  },
}));

const userDetail = {
  id: "user-1",
  name: "Alice",
  phonenumber: "0123456789",
  location: "Hanoi",
  mail: "alice@example.com",
  enabled: true,
  roles: ["photographer"],
  quote: "hello",
};

describe("UpdateUserDetail", () => {
  beforeEach(() => {
    updateUserMock.mockReset();
  });

  it("renders the user's current details and role", () => {
    renderWithProviders(
      <UpdateUserDetail userDetail={userDetail} onClose={vi.fn()} loading={vi.fn()} />,
    );

    expect(screen.getByDisplayValue("Alice")).toBeInTheDocument();
    expect(screen.getByDisplayValue("0123456789")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Hanoi")).toBeInTheDocument();
    expect(screen.getByDisplayValue("alice@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("hello")).toBeInTheDocument();
    expect(screen.getByText("nhiếp ảnh gia")).toBeInTheDocument();
  });

  it("shows quản trị viên for an admin role", () => {
    renderWithProviders(
      <UpdateUserDetail
        userDetail={{ ...userDetail, roles: ["purepixel-admin"] }}
        onClose={vi.fn()}
        loading={vi.fn()}
      />,
    );

    expect(screen.getByText("quản trị viên")).toBeInTheDocument();
  });

  it("submits the edited fields and notifies success", async () => {
    updateUserMock.mockResolvedValue({});
    const onClose = vi.fn();
    const loading = vi.fn();

    renderWithProviders(
      <UpdateUserDetail userDetail={userDetail} onClose={onClose} loading={loading} />,
    );

    const nameInput = screen.getByDisplayValue("Alice");
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Alice Updated");

    await userEvent.click(screen.getByText("Lưu chỉnh sửa"));

    await waitFor(() =>
      expect(updateUserMock).toHaveBeenCalledWith("user-1", {
        enabled: true,
        name: "Alice Updated",
        mail: "alice@example.com",
        phonenumber: "0123456789",
        quote: "hello",
        location: "Hanoi",
      }),
    );

    expect(
      await screen.findByText("Cập nhật tài khoản thành công"),
    ).toBeInTheDocument();
    await waitFor(() => expect(loading).toHaveBeenCalled());
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("shows a friendly error for an invalid phone number", async () => {
    updateUserMock.mockRejectedValue({
      response: { data: { message: ["phonenumber must match /^[0-9]+$/"] } },
    });

    renderWithProviders(
      <UpdateUserDetail userDetail={userDetail} onClose={vi.fn()} loading={vi.fn()} />,
    );

    await userEvent.click(screen.getByText("Lưu chỉnh sửa"));

    expect(
      await screen.findByText("Số điện thoại không đúng định dạng"),
    ).toBeInTheDocument();
  });

  it("shows the raw error message for other failures", async () => {
    updateUserMock.mockRejectedValue({
      response: { data: { message: ["name too long"] } },
    });

    renderWithProviders(
      <UpdateUserDetail userDetail={userDetail} onClose={vi.fn()} loading={vi.fn()} />,
    );

    await userEvent.click(screen.getByText("Lưu chỉnh sửa"));

    expect(await screen.findByText("Name too long")).toBeInTheDocument();
  });

  it("toggles the account active state", async () => {
    updateUserMock.mockResolvedValue({});

    renderWithProviders(
      <UpdateUserDetail
        userDetail={userDetail}
        onClose={vi.fn()}
        loading={vi.fn()}
      />,
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
    await userEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();

    await userEvent.click(screen.getByText("Lưu chỉnh sửa"));

    await waitFor(() =>
      expect(updateUserMock).toHaveBeenCalledWith(
        "user-1",
        expect.objectContaining({ enabled: false }),
      ),
    );
  });
});
