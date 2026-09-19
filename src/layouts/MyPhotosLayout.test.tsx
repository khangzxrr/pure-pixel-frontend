import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import useModalStore from "../states/UseModalStore";
import { renderWithProviders } from "../test/render";
import MyPhotosLayout from "./MyPhotosLayout";

const authState = vi.hoisted(() => ({
  roles: ["photographer"] as string[],
}));
const deletePhotoMock = vi.hoisted(() => vi.fn());
const getMyProfileMock = vi.hoisted(() => vi.fn());

vi.mock("@react-keycloak/web", async () => {
  const { createKeycloakMock } = await import("../test/keycloak");
  return {
    useKeycloak: () => ({
      keycloak: createKeycloakMock({ roles: authState.roles }),
      initialized: true,
    }),
  };
});

vi.mock("../services/Keycloak", () => ({
  default: {
    getTokenParsed: () => ({
      resource_access: { purepixel: { roles: authState.roles } },
    }),
  },
}));

vi.mock("../apis/PhotoApi", () => ({
  default: {
    deletePhoto: (...args: unknown[]) => deletePhotoMock(...args),
  },
}));

vi.mock("../apis/UserProfile", () => ({
  default: {
    getMyProfile: (...args: unknown[]) => getMyProfileMock(...args),
  },
}));

vi.mock("../components/PhotoProfile/PhotoProfile", () => ({
  default: ({ userData }: { userData?: { resource_access?: { purepixel?: { roles?: string[] } } } }) => (
    <div>photo profile {userData?.resource_access?.purepixel?.roles?.[0] ?? "guest"}</div>
  ),
}));

vi.mock("../components/PhotoProfile/MyPhotoP", () => ({
  default: ({
    page,
    setPage,
    itemsPerPage,
  }: {
    page: number;
    setPage: (value: number) => void;
    itemsPerPage: number;
  }) => (
    <div>
      <div>my photos page {page} size {itemsPerPage}</div>
      <button onClick={() => setPage(2)} type="button">
        set page 2
      </button>
    </div>
  ),
}));

vi.mock("../components/PhotoProfile/UpdatePhotoModal", () => ({
  default: () => <div>update photo modal</div>,
}));

vi.mock("../components/PhotoProfile/UpdateMapModal", () => ({
  default: () => <div>update map modal</div>,
}));

beforeEach(() => {
  authState.roles = ["photographer"];
  deletePhotoMock.mockReset();
  deletePhotoMock.mockResolvedValue({});
  getMyProfileMock.mockReset();
  getMyProfileMock.mockResolvedValue({ cover: "/cover.jpg", name: "Photo User" });
  useModalStore.setState({
    isUpdatePhotoModal: false,
    isUpdateOpenMapModal: false,
    isDeletePhotoConfirmModal: false,
    deletePhotoId: "",
    numberOfRecord: 0,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("MyPhotosLayout", () => {
  it("renders photographer content and deletes a photo from the last page", async () => {
    useModalStore.setState({
      isDeletePhotoConfirmModal: true,
      deletePhotoId: "p1",
      numberOfRecord: 7,
    });
    renderWithProviders(<MyPhotosLayout />);
    expect(await screen.findByText("photo profile photographer")).toBeInTheDocument();
    expect(screen.getByText("my photos page 1 size 6")).toBeInTheDocument();
    expect(getMyProfileMock).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole("button", { name: "set page 2" }));
    expect(screen.getByText("my photos page 2 size 6")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Xóa" }));

    await waitFor(() => expect(deletePhotoMock).toHaveBeenCalledWith("p1"));
    expect(useModalStore.getState().isDeletePhotoConfirmModal).toBe(false);
    expect(useModalStore.getState().deletePhotoId).toBe("");
    await waitFor(() =>
      expect(screen.getByText("my photos page 1 size 6")).toBeInTheDocument(),
    );
  });

  it("renders the update modals when their matching store flags are enabled", async () => {
    useModalStore.setState({ isUpdatePhotoModal: true, isUpdateOpenMapModal: false });

    const { unmount } = renderWithProviders(<MyPhotosLayout />);
    expect(await screen.findByText("update photo modal")).toBeInTheDocument();

    unmount();
    useModalStore.setState({ isUpdatePhotoModal: false, isUpdateOpenMapModal: true });
    getMyProfileMock.mockResolvedValueOnce({ cover: "/cover-2.jpg", name: "Photo User" });
    renderWithProviders(<MyPhotosLayout />);

    expect(await screen.findByText("update map modal")).toBeInTheDocument();
  });

  it("shows the upgrade prompt to non-photographers and lets them cancel deletion", async () => {
    authState.roles = ["user"];
    useModalStore.setState({
      isDeletePhotoConfirmModal: true,
      deletePhotoId: "p2",
      numberOfRecord: 2,
    });

    renderWithProviders(<MyPhotosLayout />);

    expect(
      await screen.findByText(/Hãy/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/my photos page/i)).toBeNull();

    await userEvent.click(screen.getByRole("button", { name: "Hủy" }));
    expect(useModalStore.getState().isDeletePhotoConfirmModal).toBe(false);
  });
});
