import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ComThanksModal from "./ComThanksModal";

const MESSAGE = /Xin cám ơn những người bạn/;
const KEY = "thanksModalDismissed";

describe("ComThanksModal", () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it("shows the thanks message and photo", () => {
    render(<ComThanksModal />);
    expect(screen.getByText(MESSAGE)).toBeInTheDocument();
    expect(screen.getByAltText("Minh, Trung, Bảo và Khang")).toBeInTheDocument();
  });

  it("closes without remembering when the box is not ticked", async () => {
    render(<ComThanksModal />);

    await userEvent.click(screen.getByRole("button", { name: "Đóng" }));

    await waitFor(() => expect(screen.getByText(MESSAGE)).not.toBeVisible());
    expect(window.localStorage.getItem(KEY)).toBe("false");
  });

  it("remembers the choice when the box is ticked", async () => {
    render(<ComThanksModal />);

    await userEvent.click(screen.getByRole("checkbox"));
    await userEvent.click(screen.getByRole("button", { name: "Đóng" }));

    expect(screen.queryByText(MESSAGE)).not.toBeInTheDocument();
    expect(window.localStorage.getItem(KEY)).toBe("true");
  });

  it("stays hidden once dismissed", () => {
    window.localStorage.setItem(KEY, "true");
    render(<ComThanksModal />);
    expect(screen.queryByText(MESSAGE)).not.toBeInTheDocument();
  });
});
