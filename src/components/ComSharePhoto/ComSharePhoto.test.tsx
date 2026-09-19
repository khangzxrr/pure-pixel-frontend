import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ComSharePhoto from "./ComSharePhoto";

const auth = vi.hoisted(() => ({ authenticated: true }));

vi.mock("@react-keycloak/web", async () => {
  const { createKeycloakMock } = await import("../../test/keycloak");
  return {
    useKeycloak: () => ({
      keycloak: createKeycloakMock({
        authenticated: auth.authenticated,
        sub: "user-1",
      }),
      initialized: true,
    }),
  };
});

type ShareStubProps = { photoId?: string; onClose: () => void };

vi.mock("./OwnerSharePhotoComponent", () => ({
  default: ({ photoId, onClose }: ShareStubProps) => (
    <button onClick={onClose}>owner share {photoId}</button>
  ),
}));

vi.mock("./OtherUserSharePhotoComponent", () => ({
  default: ({ photoId, onClose }: ShareStubProps) => (
    <button onClick={onClose}>link share {photoId}</button>
  ),
}));

describe("ComSharePhoto", () => {
  beforeEach(() => {
    auth.authenticated = true;
  });

  it("lets the owner share a chosen resolution", async () => {
    const onClose = vi.fn();
    render(<ComSharePhoto photoId="p1" userId="user-1" onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: "owner share p1" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/link share/)).toBeNull();
  });

  it("gives other users the photo link", async () => {
    const onClose = vi.fn();
    const { container } = render(
      <ComSharePhoto photoId="p1" userId="someone-else" onClose={onClose} />,
    );

    await userEvent.click(screen.getByRole("button", { name: "link share p1" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(container.firstChild).toHaveClass("bg-white");
    expect(screen.queryByText(/owner share/)).toBeNull();
  });

  it("gives signed-out visitors the photo link", () => {
    auth.authenticated = false;
    render(<ComSharePhoto photoId="p1" userId="user-1" onClose={vi.fn()} />);

    expect(screen.getByRole("button", { name: "link share p1" })).toBeInTheDocument();
  });
});
