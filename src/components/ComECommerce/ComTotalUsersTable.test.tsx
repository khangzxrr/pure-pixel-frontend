import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/render";
import ComTotalUsersTable from "./ComTotalUsersTable";

describe("ComTotalUsersTable", () => {
  it("renders the static ranking table data", () => {
    renderWithProviders(<ComTotalUsersTable />);

    expect(screen.getByText("Top Channels")).toBeInTheDocument();
    expect(screen.getByText("Source")).toBeInTheDocument();
    expect(screen.getByText("Visitors")).toBeInTheDocument();
    expect(screen.getByText("Revenues")).toBeInTheDocument();
    expect(screen.getByText("Sales")).toBeInTheDocument();
    expect(screen.getByText("Conversion")).toBeInTheDocument();
    expect(screen.getByText("Google")).toBeInTheDocument();
    expect(screen.getAllByText("3.5K")).toHaveLength(6);
    expect(screen.getByText("$5,768")).toBeInTheDocument();
    expect(screen.getByText("590")).toBeInTheDocument();
    expect(screen.getByText("4.8%")).toBeInTheDocument();
    expect(screen.getAllByText("Facebook")).toHaveLength(5);
  });
});
