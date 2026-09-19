import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import usePhotoMapStore from "../../../states/UsePhotoMapStore";
import PhotoListByMap from "./PhotoListByMap";

const photos = [
  {
    id: "p1",
    title: "Photo one",
    signedUrl: { thumbnail: "thumb-1.jpg" },
  },
  {
    id: "p2",
    title: "Photo two",
    signedUrl: { thumbnail: "thumb-2.jpg" },
  },
  {
    id: "p3",
    title: "Photo three",
    signedUrl: { thumbnail: "thumb-3.jpg" },
  },
];

const renderList = (handleSelectPhoto = vi.fn()) =>
  render(
    <PhotoListByMap
      page={1}
      setPage={vi.fn()}
      totalPage={2}
      isAddNewPhotoList={false}
      setIsAddNewPhotoList={vi.fn()}
      handleSelectPhoto={handleSelectPhoto}
      setIsStopped={vi.fn()}
    />,
  );

describe("PhotoListByMap", () => {
  beforeEach(() => {
    usePhotoMapStore.setState({
      photoList: photos as never,
      selectedPhoto: null,
      isFromPhotoDetailPage: false,
    });
  });

  it("scrolls the selected photo into view and highlights it", () => {
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });
    usePhotoMapStore.setState({
      selectedPhoto: {
        id: "p2",
        photo_id: "p2",
        photographer_id: "ptg-1",
        title: "Photo two",
        photo_url: "thumb-2.jpg",
        latitude: 10.8,
        longitude: 106.7,
      },
    });

    renderList();

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "center",
    });
    // the selected gallery item (an ancestor of the photo) is highlighted
    expect(screen.getByAltText("Photo two").closest(".border-2")).not.toBeNull();
    expect(screen.getByAltText("Photo one").closest(".border-2")).toBeNull();
  });

  it("selects photos from the gallery and cycles with the arrow buttons", async () => {
    const handleSelectPhoto = vi.fn();
    usePhotoMapStore.setState({
      selectedPhoto: {
        id: "p2",
        photo_id: "p2",
        photographer_id: "ptg-1",
        title: "Photo two",
        photo_url: "thumb-2.jpg",
        latitude: 10.8,
        longitude: 106.7,
      },
    });

    renderList(handleSelectPhoto);

    await userEvent.click(screen.getByAltText("Photo one"));
    await userEvent.click(screen.getAllByRole("button")[0]);
    await userEvent.click(screen.getAllByRole("button")[1]);

    expect(handleSelectPhoto).toHaveBeenNthCalledWith(1, photos[0]);
    expect(handleSelectPhoto).toHaveBeenNthCalledWith(2, photos[0]);
    expect(handleSelectPhoto).toHaveBeenNthCalledWith(3, photos[2]);
  });

  it("starts from the first photo when nothing is selected", async () => {
    const handleSelectPhoto = vi.fn();

    renderList(handleSelectPhoto);

    await userEvent.click(screen.getAllByRole("button")[0]);
    await userEvent.click(screen.getAllByRole("button")[1]);

    expect(handleSelectPhoto).toHaveBeenNthCalledWith(1, photos[0]);
    expect(handleSelectPhoto).toHaveBeenNthCalledWith(2, photos[0]);
  });
});
