import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { MockInstance } from "vitest";
import { renderWithProviders } from "../../../test/render";
import { mockEndpoint } from "../../../test/mockEndpoint";
import { server } from "../../../test/server";
import EditCamera from "./EditCamera";
import type { CameraRow } from "./TableCamera";

vi.mock("../../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const camera: CameraRow = {
  id: "cam-1",
  name: "Fujifilm X-T5",
  thumbnail: "https://cdn.test/xt5.jpg",
  description: "Máy ảnh mirrorless",
  userCount: 3,
  photoCount: 12,
};

const setup = (selected: Partial<CameraRow> = camera) => {
  const onClose = vi.fn();
  const tableRef = vi.fn();
  const view = renderWithProviders(
    <EditCamera
      selectedUpgrede={selected}
      onClose={onClose}
      tableRef={tableRef}
    />,
  );
  return { ...view, onClose, tableRef };
};

const nameInput = () => screen.getByPlaceholderText("Tên camera");
const submit = () =>
  userEvent.click(screen.getByRole("button", { name: "Cập nhật" }));

const pickImage = async (container: HTMLElement) => {
  // antd posts the picked file to its (empty) upload action
  server.use(http.post("*", () => HttpResponse.json({})));
  const input = container.querySelector<HTMLInputElement>('input[type="file"]');
  if (!input) throw new Error("no file input");
  await userEvent.upload(
    input,
    new File(["image"], "new.png", { type: "image/png" }),
  );
};

describe("EditCamera", () => {
  let consoleError: MockInstance<typeof console.error>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it("updates the name and description without an image", async () => {
    const requests = mockEndpoint("patch", "*/manager/camera/:id", {});
    const { onClose, tableRef } = setup();

    expect(nameInput()).toHaveValue("Fujifilm X-T5");
    expect(screen.getByAltText("avatar")).toHaveAttribute(
      "src",
      "https://cdn.test/xt5.jpg",
    );
    await userEvent.clear(nameInput());
    await userEvent.type(nameInput(), "Sony A7");
    await submit();

    expect(await screen.findByText("Đã cập nhật")).toBeInTheDocument();
    expect(requests[0].path).toBe("/manager/camera/cam-1");
    const form = requests[0].form;
    expect(form?.get("name")).toBe("Sony A7");
    expect(form?.get("description")).toBe("Máy ảnh mirrorless");
    expect(form?.has("thumbnail")).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(tableRef).toHaveBeenCalledTimes(1));
  });

  it("reports a failed update without an image", async () => {
    let release = () => {};
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    server.use(
      http.patch("*/manager/camera/:id", async () => {
        await pending;
        return HttpResponse.json({ statusCode: 500 }, { status: 500 });
      }),
    );
    const { onClose, tableRef } = setup();

    await submit();
    expect(
      await screen.findByRole("button", { name: "Đang cập nhật..." }),
    ).toBeDisabled();
    release();

    expect(await screen.findByText("Vui lòng thử lại")).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: "Cập nhật" }),
    ).toBeEnabled();
    expect(consoleError).toHaveBeenCalledWith(
      expect.objectContaining({ response: expect.anything() }),
    );
    expect(onClose).not.toHaveBeenCalled();
    expect(tableRef).not.toHaveBeenCalled();
  });

  it("sends the picked image with the fields", async () => {
    const requests = mockEndpoint("patch", "*/manager/camera/:id", {});
    const { container, onClose, tableRef } = setup();

    await pickImage(container);
    await submit();

    expect(await screen.findByText("Đã cập nhật")).toBeInTheDocument();
    const form = requests[0].form;
    expect(form?.get("thumbnail")).toMatchObject({ name: "new.png" });
    expect(form?.get("name")).toBe("Fujifilm X-T5");
    expect(form?.get("description")).toBe("Máy ảnh mirrorless");
    expect(onClose).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(tableRef).toHaveBeenCalledTimes(1));
  });

  it("marks the name as taken when the server answers with a status code", async () => {
    mockEndpoint("patch", "*/manager/camera/:id", () =>
      HttpResponse.json({ statusCode: 409 }, { status: 409 }),
    );
    const { container, onClose } = setup();

    await pickImage(container);
    await submit();

    expect(
      await screen.findByText("Tên máy ảnh này đã tồn tại"),
    ).toBeInTheDocument();
    expect(screen.getByText("Vui lòng thử lại")).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith(1111, 409);
    expect(screen.getByRole("button", { name: "Cập nhật" })).toBeEnabled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("only reports a failed image update without a status code", async () => {
    mockEndpoint(
      "patch",
      "*/manager/camera/:id",
      () => new HttpResponse(null, { status: 502 }),
    );
    const { container } = setup({ id: "cam-2" });

    await pickImage(container);
    await userEvent.type(nameInput(), "Canon R5");
    await submit();

    expect(await screen.findByText("Vui lòng thử lại")).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith(1111, undefined);
    expect(screen.queryByText("Tên máy ảnh này đã tồn tại")).toBeNull();
  });

  it("requires a name", async () => {
    const requests = mockEndpoint("patch", "*/manager/camera/:id", {});
    setup();

    await userEvent.clear(nameInput());
    await submit();

    expect(await screen.findByText("Vui lòng nhập tên")).toBeInTheDocument();
    expect(requests).toHaveLength(0);
  });
});
