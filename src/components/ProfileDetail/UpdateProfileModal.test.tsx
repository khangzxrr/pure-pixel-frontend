import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/render";
import useModalStore from "../../states/UseModalStore";
import UpdateProfileModal from "./UpdateProfileModal";

const updateUserProfileMock = vi.hoisted(() => vi.fn());

vi.mock("../../apis/UserProfile", () => ({
  default: {
    updateUserProfile: (...args: unknown[]) => updateUserProfileMock(...args),
  },
}));

const userData = {
  name: "Alice",
  quote: "Hello there",
  location: "Hanoi",
  mail: "alice@example.com",
  phonenumber: "0912345678",
  cover: "/cover.jpg",
  avatar: "/avatar.jpg",
};

describe("UpdateProfileModal", () => {
  beforeEach(() => {
    updateUserProfileMock.mockReset();
    useModalStore.setState({ isUpdateProfileModalVisible: false });
  });

  afterEach(() => {
    useModalStore.setState({ isUpdateProfileModalVisible: false });
  });

  it("is hidden until the modal store flag is enabled", () => {
    renderWithProviders(<UpdateProfileModal userData={userData} />);
    expect(screen.queryByText("Cập nhật hồ sơ")).not.toBeInTheDocument();

    act(() => {
      useModalStore.setState({ isUpdateProfileModalVisible: true });
    });
    expect(screen.getAllByText("Cập nhật hồ sơ").length).toBeGreaterThan(0);
  });

  it("pre-fills the form from userData", () => {
    useModalStore.setState({ isUpdateProfileModalVisible: true });
    renderWithProviders(<UpdateProfileModal userData={userData} />);

    expect(screen.getByDisplayValue("Alice")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Hello there")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Hanoi")).toBeInTheDocument();
    expect(screen.getByDisplayValue("alice@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("0912345678")).toBeInTheDocument();
  });

  it("shows a validation error when the name is cleared", async () => {
    useModalStore.setState({ isUpdateProfileModalVisible: true });
    renderWithProviders(<UpdateProfileModal userData={userData} />);

    const nameInput = screen.getByDisplayValue("Alice");
    await userEvent.clear(nameInput);
    await userEvent.click(
      screen.getAllByText("Cập nhật hồ sơ").find((el) => el.tagName === "SPAN")!,
    );

    expect(await screen.findByText("Tên là bắt buộc")).toBeInTheDocument();
    expect(updateUserProfileMock).not.toHaveBeenCalled();
  });

  it("submits the updated profile and shows a success notification", async () => {
    updateUserProfileMock.mockResolvedValue({});
    useModalStore.setState({ isUpdateProfileModalVisible: true });
    renderWithProviders(<UpdateProfileModal userData={userData} />);

    const nameInput = screen.getByDisplayValue("Alice");
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Alice Updated");

    await userEvent.click(
      screen.getAllByText("Cập nhật hồ sơ").find((el) => el.tagName === "SPAN")!,
    );

    await waitFor(() => expect(updateUserProfileMock).toHaveBeenCalledTimes(1));
    const submitted = updateUserProfileMock.mock.calls[0][0];
    expect(submitted.name).toBe("Alice Updated");

    expect(
      await screen.findByText(
        "Hồ sơ của bạn đã được cập nhật thành công.",
      ),
    ).toBeInTheDocument();
    expect(useModalStore.getState().isUpdateProfileModalVisible).toBe(false);
  });

  it("shows an error notification when the update fails", async () => {
    updateUserProfileMock.mockRejectedValue(new Error("failed"));
    useModalStore.setState({ isUpdateProfileModalVisible: true });
    renderWithProviders(<UpdateProfileModal userData={userData} />);

    await userEvent.click(
      screen.getAllByText("Cập nhật hồ sơ").find((el) => el.tagName === "SPAN")!,
    );

    expect(
      await screen.findByText(
        "Không thể cập nhật hồ sơ của bạn. Vui lòng thử lại.",
      ),
    ).toBeInTheDocument();
  });
});
