import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/render";
import UpgradeToPtg from "./UpgradeToPtg";

const navigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

describe("UpgradeToPtg", () => {
  afterEach(() => {
    navigate.mockReset();
  });

  it("shows the call to action to become a photographer", () => {
    renderWithProviders(<UpgradeToPtg />);

    expect(
      screen.getByText("Hãy trở thành nhiếp ảnh gia!"),
    ).toBeInTheDocument();
  });

  it("navigates to the upgrade page on click", async () => {
    renderWithProviders(<UpgradeToPtg />);

    await userEvent.click(screen.getByText("Hãy trở thành nhiếp ảnh gia!"));

    expect(navigate).toHaveBeenCalledWith("/upgrade");
  });
});
