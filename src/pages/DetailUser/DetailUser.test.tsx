import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/render";
import UseUserOtherStore from "../../states/UseUserOtherStore";
import DetailUser from "./DetailUser";

const navigateMock = vi.hoisted(() => vi.fn());
const getDataMock = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock("../../apis/api", () => ({
  getData: (...args: unknown[]) => getDataMock(...args),
}));

const packageResponse = (objects: unknown[]) => ({ data: { objects } });
const photoResponse = (objects: unknown[], totalRecord: number) => ({
  data: { objects, totalRecord },
});

describe("DetailUser", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    getDataMock.mockReset();
    UseUserOtherStore.setState({ nameUserOther: "", userOtherId: undefined });
  });

  it("shows the profile header and an empty package state when there are none", async () => {
    getDataMock.mockImplementation((url: string) => {
      if (url.includes("/photoshoot-package/")) {
        return Promise.resolve(packageResponse([]));
      }
      return Promise.resolve(photoResponse([], 0));
    });

    renderWithProviders(
      <DetailUser
        id="user-1"
        data={{ id: "user-1", name: "Nguyen Van A", cover: "/cover.jpg", avatar: "/avatar.jpg", quote: "hi" }}
      />,
    );

    expect(screen.getByText("Nguyen Van A")).toBeInTheDocument();
    expect(await screen.findByText("Hiện tại chưa có dịch vụ nào")).toBeInTheDocument();
  });

  it("lists photoshoot packages and shows the photo count badge", async () => {
    getDataMock.mockImplementation((url: string) => {
      if (url.includes("/photoshoot-package/")) {
        return Promise.resolve(
          packageResponse([{ title: "Gói cơ bản", subtitle: "Basic", thumbnail: "/p1.jpg" }]),
        );
      }
      return Promise.resolve(
        photoResponse(
          [
            {
              id: "photo-1",
              signedUrl: { thumbnail: "/photo1.jpg" },
              photographer: { name: "Nguyen Van A", avatar: "/avatar.jpg" },
              _count: { votes: 3 },
            },
          ],
          1,
        ),
      );
    });

    renderWithProviders(
      <DetailUser id="user-1" data={{ id: "user-1", name: "Nguyen Van A" }} />,
    );

    expect(await screen.findByText("Gói cơ bản")).toBeInTheDocument();

    const packagesTab = screen.getByRole("button", { name: /Dịch vụ/ });
    expect(within(packagesTab).getByText("1")).toBeInTheDocument();

    const imagesTab = screen.getByRole("button", { name: /Hình ảnh/ });
    await waitFor(() => expect(within(imagesTab).getByText("1")).toBeInTheDocument());
  });

  it("switches tabs and navigates when a photo is clicked", async () => {
    getDataMock.mockImplementation((url: string) => {
      if (url.includes("/photoshoot-package/")) {
        return Promise.resolve(packageResponse([]));
      }
      return Promise.resolve(
        photoResponse(
          [
            {
              id: "photo-9",
              signedUrl: { thumbnail: "/photo9.jpg" },
              photographer: { name: "Nguyen Van A", avatar: "/avatar.jpg" },
              _count: { votes: 5 },
            },
          ],
          1,
        ),
      );
    });

    renderWithProviders(
      <DetailUser id="user-1" data={{ id: "user-1", name: "Nguyen Van A" }} />,
    );

    await userEvent.click(screen.getByRole("button", { name: /Hình ảnh/ }));
    const photoImg = await screen.findByAltText("Photo photo-9");
    await userEvent.click(photoImg);

    expect(navigateMock).toHaveBeenCalledWith("/photo/photo-9");

    await userEvent.click(screen.getByRole("button", { name: /Albums/ }));
    expect(screen.getByText("DISCOVER OUR SIX PACKAGES")).toBeInTheDocument();
  });

  it("navigates to the user's photo page and updates the other-user store when the name is clicked", async () => {
    getDataMock.mockImplementation((url: string) => {
      if (url.includes("/photoshoot-package/")) {
        return Promise.resolve(packageResponse([]));
      }
      return Promise.resolve(photoResponse([], 0));
    });

    renderWithProviders(
      <DetailUser id="user-2" data={{ id: "user-2", name: "Tran Thi B" }} />,
    );

    await userEvent.click(await screen.findByText("Tran Thi B"));

    expect(navigateMock).toHaveBeenCalledWith("/user/user-2/photos");
    expect(UseUserOtherStore.getState().nameUserOther).toBe("Tran Thi B");
    expect(UseUserOtherStore.getState().userOtherId).toBe("user-2");
  });
});
