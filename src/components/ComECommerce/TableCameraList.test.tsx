import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/render";
import UseTotalCameraUsedByUserStore from "../../states/UseTotalCameraUsedByUserStore";
import TableCameraList from "./TableCameraList";

const initialStoreState = UseTotalCameraUsedByUserStore.getState();

describe("TableCameraList", () => {
  afterEach(() => {
    UseTotalCameraUsedByUserStore.setState({
      idCameraByBrand: initialStoreState.idCameraByBrand,
      nameCameraByBrand: initialStoreState.nameCameraByBrand,
    });
  });

  it("renders camera ranking data and stores the selected camera when clicked", async () => {
    renderWithProviders(
      <TableCameraList
        dataCamera={[
          {
            maker: {
              id: "maker-1",
              name: "Canon",
              thumbnail: "https://example.com/canon.jpg",
              cameras: [{ name: "EOS R5" }, { name: "EOS R6 Mark II" }],
            },
            userCount: 12,
          },
        ]}
      />,
    );

    expect(
      screen.getByText("Danh sách xếp hạng các máy ảnh phổ biến nhất"),
    ).toBeInTheDocument();
    expect(screen.getByText("Canon")).toBeInTheDocument();
    expect(screen.getByText("EOS R5, EOS R6 Mark II")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Canon"));

    expect(UseTotalCameraUsedByUserStore.getState()).toMatchObject({
      idCameraByBrand: "maker-1",
      nameCameraByBrand: "Canon",
    });
  });
});
