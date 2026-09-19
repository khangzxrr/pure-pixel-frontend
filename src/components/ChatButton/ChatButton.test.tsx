import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/render";
import ChatButton from "./ChatButton";

const navigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

describe("ChatButton", () => {
  it("opens the conversation without triggering the parent click", async () => {
    const onParentClick = vi.fn();
    const { container } = renderWithProviders(
      <div onClick={onParentClick}>
        <ChatButton userId="user-9" />
      </div>,
    );

    const icon = container.querySelector("svg");
    expect(icon).not.toBeNull();
    await userEvent.click(icon as SVGSVGElement);

    expect(navigate).toHaveBeenCalledWith("/message?to=user-9");
    expect(onParentClick).not.toHaveBeenCalled();
  });
});
