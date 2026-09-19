import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import type { MockInstance } from "vitest";
import { createTestQueryClient, renderWithProviders } from "../../test/render";
import { server } from "../../test/server";
import { mockEndpoint } from "../../test/mockEndpoint";
import CreatePhotoshootPackage from "./CreatePhotoshootPackage";

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

// the cropper opens a canvas editor before every upload; pass the file straight through
vi.mock("antd-img-crop", () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

const CREATE_URL = "*/photographer/photoshoot-package/v2";

const fileInputs = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLInputElement>('input[type="file"]'));

const image = (name: string) => new File(["image"], name, { type: "image/png" });

// antd posts picked files to the upload action, which is the current page here
const acceptUploads = () =>
  server.use(http.post(window.location.href, () => HttpResponse.json({})));

const fillForm = async () => {
  await userEvent.type(screen.getByPlaceholderText("Tựa đề của gói"), "Gói cưới");
  await userEvent.type(screen.getByPlaceholderText("Phụ đề"), "Trọn gói");
  await userEvent.type(screen.getByPlaceholderText("Nhập giá"), "150000");
  await userEvent.type(
    screen.getByPlaceholderText("Phần mô tả chi tiết gói sẽ nằm ở đây"),
    "Chụp cả ngày",
  );
};

const submit = () => userEvent.click(screen.getByRole("button", { name: "Tạo gói chụp" }));

// PhotoService previews files through FileReader and assigns onload/onerror right after starting the read;
// files named "broken..." fail there. The upload body streams the same file through a load listener
// (no onerror handler), which keeps reading normally.
const failReadingBrokenFiles = () => {
  const readAsArrayBuffer = FileReader.prototype.readAsArrayBuffer;
  return vi
    .spyOn(FileReader.prototype, "readAsArrayBuffer")
    .mockImplementation(function (this: FileReader, blob: Blob) {
      // decide once the caller has attached its handlers
      queueMicrotask(() => {
        const { onerror } = this;
        if (onerror && blob instanceof File && blob.name.startsWith("broken")) {
          onerror.call(this, new ProgressEvent("error") as ProgressEvent<FileReader>);
          return;
        }
        readAsArrayBuffer.call(this, blob);
      });
    });
};

describe("CreatePhotoshootPackage", () => {
  let consoleError: MockInstance<typeof console.error>;
  let objectUrls: MockInstance<typeof URL.createObjectURL>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    let next = 0;
    objectUrls = vi
      .spyOn(URL, "createObjectURL")
      .mockImplementation(() => `blob:preview-${++next}`);
    acceptUploads();
  });

  afterEach(() => {
    vi.mocked(FileReader.prototype.readAsArrayBuffer).mockRestore?.();
    objectUrls.mockRestore();
    // antd's tooltip falls back to the deprecated findDOMNode around the upload
    const unexpected = consoleError.mock.calls
      .map((args) => args.map(String).join(" "))
      .filter((message) => !message.includes("deprecated"));
    consoleError.mockRestore();
    expect(unexpected.join("\n")).toBe("");
  });

  it("validates every field before submitting", async () => {
    const creates = mockEndpoint("post", CREATE_URL, {});
    renderWithProviders(<CreatePhotoshootPackage onClose={vi.fn()} />);

    await submit();

    expect(await screen.findByText("Vui lòng nhập tiêu đề.")).toBeInTheDocument();
    expect(screen.getByText("Vui lòng nhập phụ đề.")).toBeInTheDocument();
    expect(screen.getByText("Giá gói là bắt buộc")).toBeInTheDocument();
    expect(screen.getByText("Vui lòng nhập mô tả.")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Tựa đề của gói")).toHaveClass("border-red-500");

    await userEvent.type(screen.getByPlaceholderText("Nhập giá"), "5000");
    await submit();
    expect(
      await screen.findByText("Giá gói ít nhất là 10.000đ"),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nhập giá")).toHaveValue("5.000 ₫");
    expect(creates).toHaveLength(0);
  });

  it("requires a cover image", async () => {
    renderWithProviders(<CreatePhotoshootPackage onClose={vi.fn()} />);
    await fillForm();

    await submit();

    expect(await screen.findByText("Vui lòng chọn ảnh bìa.")).toBeInTheDocument();
    expect(screen.getByText("Hình ảnh không hợp lệ")).toBeInTheDocument();
  });

  it("requires showcase photos", async () => {
    const { container } = renderWithProviders(
      <CreatePhotoshootPackage onClose={vi.fn()} />,
    );
    await userEvent.upload(fileInputs(container)[0], image("cover.png"));
    expect(await screen.findByAltText("Thumbnail")).toHaveAttribute(
      "src",
      "blob:preview-1",
    );
    await fillForm();

    await submit();

    expect(
      await screen.findByText("Vui lòng chọn ảnh cho bộ sưu tập."),
    ).toBeInTheDocument();
  });

  it("creates the package with the cover and the chosen showcases", async () => {
    const creates = mockEndpoint("post", CREATE_URL, { id: "pk1" });
    const onClose = vi.fn();
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(["findAllPhotoshootPackages", 1, "desc"], {});
    const { container } = renderWithProviders(
      <CreatePhotoshootPackage onClose={onClose} />,
      { queryClient },
    );
    const [coverInput, showcaseInput] = fileInputs(container);
    expect(container.querySelectorAll(".bg-\\[\\#767676\\]")).toHaveLength(20);

    await userEvent.upload(coverInput, image("cover.png"));
    await screen.findByAltText("Thumbnail");
    await userEvent.upload(showcaseInput, [image("one.png"), image("two.png"), image("three.png")]);
    expect(await screen.findByAltText("Showcase 3")).toBeInTheDocument();
    expect(container.querySelectorAll(".bg-\\[\\#767676\\]")).toHaveLength(17);

    // remove the second showcase before creating
    const second = screen.getByAltText("Showcase 2").parentElement as HTMLElement;
    await userEvent.click(within(second).getByRole("button"));
    expect(screen.queryByAltText("Showcase 3")).toBeNull();

    await fillForm();
    expect(screen.getByPlaceholderText("Nhập giá")).toHaveValue("150.000 ₫");
    await submit();

    expect(await screen.findByText("Tạo gói chụp thành công")).toBeInTheDocument();
    expect(creates).toHaveLength(1);
    const form = creates[0].form as FormData;
    expect(form.get("title")).toBe("Gói cưới");
    expect(form.get("subtitle")).toBe("Trọn gói");
    expect(form.get("price")).toBe("150000");
    expect(form.get("description")).toBe("Chụp cả ngày");
    expect(form.get("thumbnail")).toMatchObject({ name: "cover.png" });
    expect(form.getAll("showcases[0]")).toEqual([expect.objectContaining({ name: "one.png" })]);
    expect(form.get("showcases[1]")).toMatchObject({ name: "three.png" });
    expect(form.get("showcases[2]")).toBeNull();

    expect(onClose).toHaveBeenCalledTimes(1);
    // the form and the picked images are cleared
    await waitFor(() =>
      expect(screen.getByPlaceholderText("Tựa đề của gói")).toHaveValue(""),
    );
    expect(screen.queryByAltText("Thumbnail")).toBeNull();
    expect(screen.queryByAltText("Showcase 1")).toBeNull();
    expect(
      queryClient.getQueryState(["findAllPhotoshootPackages", 1, "desc"])
        ?.isInvalidated,
    ).toBe(true);
  });

  it("keeps the form when the package cannot be created", async () => {
    server.use(http.post(CREATE_URL, () => new HttpResponse(null, { status: 500 })));
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const onClose = vi.fn();
    const { container } = renderWithProviders(
      <CreatePhotoshootPackage onClose={onClose} />,
    );
    const [coverInput, showcaseInput] = fileInputs(container);
    await userEvent.upload(coverInput, image("cover.png"));
    await userEvent.upload(showcaseInput, image("one.png"));
    await screen.findByAltText("Showcase 1");
    await fillForm();

    await submit();

    expect(await screen.findByText("Tạo gói chụp thất bại")).toBeInTheDocument();
    expect(log).toHaveBeenCalledWith(expect.objectContaining({ name: "AxiosError" }));
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByPlaceholderText("Tựa đề của gói")).toHaveValue("Gói cưới");
    log.mockRestore();
  });

  it("logs a cover image that cannot be read", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    failReadingBrokenFiles();
    const { container } = renderWithProviders(
      <CreatePhotoshootPackage onClose={vi.fn()} />,
    );

    await userEvent.upload(fileInputs(container)[0], image("broken-cover.png"));

    await waitFor(() =>
      expect(log).toHaveBeenCalledWith(expect.objectContaining({ type: "error" })),
    );
    expect(screen.queryByAltText("Thumbnail")).toBeNull();
    log.mockRestore();
  });

  it("logs a showcase photo that cannot be read", async () => {
    failReadingBrokenFiles();
    const { container } = renderWithProviders(
      <CreatePhotoshootPackage onClose={vi.fn()} />,
    );

    await userEvent.upload(fileInputs(container)[1], image("broken-one.png"));

    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith(
        "Error in onShowcasesChange:",
        expect.objectContaining({ type: "error" }),
      ),
    );
    consoleError.mockClear();
    expect(screen.queryByAltText("Showcase 1")).toBeNull();
  });
});
