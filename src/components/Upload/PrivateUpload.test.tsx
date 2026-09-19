import { render, screen } from "@testing-library/react";
import PrivateUpload from "./PrivateUpload";

describe("PrivateUpload", () => {
  it("renders its placeholder", () => {
    render(<PrivateUpload />);
    expect(screen.getByText("PrivateUpload")).toBeInTheDocument();
  });
});
