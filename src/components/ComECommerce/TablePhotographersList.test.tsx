import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocation } from "react-router-dom";
import { renderWithProviders } from "../../test/render";
import TablePhotographersList from "./TablePhotographersList";

const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
};

describe("TablePhotographersList", () => {
  it("renders seller rows and navigates to the photographer detail page", async () => {
    renderWithProviders(
      <>
        <TablePhotographersList
          dataTopSeller={[
            {
              id: "ptg-1",
              detail: {
                name: "Le Thanh",
                avatar: "https://example.com/avatar.jpg",
                mail: "le@example.com",
                phonenumber: "0909009009",
                location: "Hue",
              },
              totalPhotoSale: 21,
            },
          ]}
        />
        <LocationDisplay />
      </>,
      { route: "/", path: "*" },
    );

    expect(
      screen.getByText("Danh sách xếp hạng các nhiếp ảnh gia bán được nhiều ảnh"),
    ).toBeInTheDocument();
    expect(screen.getByText("Le Thanh")).toBeInTheDocument();
    expect(screen.getByText("le@example.com")).toBeInTheDocument();
    expect(screen.getByText("0909009009")).toBeInTheDocument();
    expect(screen.getByText("Hue")).toBeInTheDocument();
    expect(screen.getByText("21")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Le Thanh"));

    expect(screen.getByTestId("location-display")).toHaveTextContent(
      "/ptgDetail/ptg-1",
    );
  });
});
