import { act, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { renderWithProviders } from "../../../test/render";
import { mockEndpoint } from "../../../test/mockEndpoint";
import useBookingPhotoStore from "../../../states/UseBookingPhotoStore";
import { buildBooking } from "../bookingTestData";
import UploadBookingPhoto from "./BookingDetailUpload";

type DraggerProps = {
  children?: ReactNode;
  itemRender?: () => unknown;
  onChange?: (info: {
    file: { uid: string; status?: string };
  }) => Promise<void> | void;
  customRequest?: (options: {
    file: unknown;
    onError: () => void;
    onSuccess: () => void;
  }) => Promise<void> | void;
};

// the props the component passed to the (stubbed) Dragger on its last render
const dragger = vi.hoisted(() => ({ props: {} as DraggerProps }));

vi.mock("../../../services/Keycloak", () => ({
  default: {
    isLoggedIn: () => false,
    getToken: () => undefined,
    getUserId: () => "photographer-1",
    hasRole: () => false,
  },
}));

// the real Dragger never calls these handlers in the ways below (no upload list, no removal,
// always a file object), so they are called directly; the upload flow itself is in
// BookingDetailUpload.test.tsx
vi.mock("antd", async (importOriginal) => {
  const antd = await importOriginal<typeof import("antd")>();
  const Dragger = (props: DraggerProps) => {
    dragger.props = props;
    return <div data-testid="dragger">{props.children}</div>;
  };
  return { ...antd, Upload: Object.assign(() => null, { Dragger }) };
});

const renderUpload = () =>
  renderWithProviders(
    <UploadBookingPhoto bookingDetail={buildBooking({ status: "ACCEPTED" })} />,
    {
      route: "/profile/booking-request/booking-1",
      path: "/profile/booking-request/:bookingId",
    },
  );

describe("UploadBookingPhoto dragger handlers", () => {
  beforeEach(() => useBookingPhotoStore.getState().clearState());

  it("renders nothing for upload list items", () => {
    renderUpload();

    expect(screen.getByTestId("dragger")).toHaveTextContent(
      "Nhấp hoặc kéo tệp vào khu vực này để tải lên",
    );
    expect(dragger.props.itemRender?.()).toBe("");
  });

  it("ignores a removed file", async () => {
    renderUpload();

    await act(async () => {
      await dragger.props.onChange?.({
        file: { uid: "upload-1", status: "removed" },
      });
    });

    expect(useBookingPhotoStore.getState().photoArray).toEqual([]);
    expect(document.querySelector(".ant-message-notice")).toBeNull();
  });

  it("skips a request that carries no file object", async () => {
    const requests = mockEndpoint(
      "put",
      "*/photographer/booking/:id/upload/v2",
      {},
    );
    renderUpload();
    const onError = vi.fn();
    const onSuccess = vi.fn();

    await act(async () => {
      await dragger.props.customRequest?.({
        file: "not-a-file",
        onError,
        onSuccess,
      });
    });

    expect(onError).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(requests).toHaveLength(0);
  });
});
