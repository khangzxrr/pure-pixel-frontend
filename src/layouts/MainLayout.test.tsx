import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../test/render";
import MainLayout from "./MainLayout";

describe("MainLayout", () => {
  it("renders nested route content inside the main background wrapper", () => {
    const { container } = renderWithProviders(
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<div>main layout child</div>} />
        </Route>
      </Routes>,
      { route: "/" },
    );

    expect(screen.getByText("main layout child")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass("bg-[#f7f8fa]");
  });
});
