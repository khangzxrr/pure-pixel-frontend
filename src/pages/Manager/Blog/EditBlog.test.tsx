import type { ChangeEvent } from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { MockInstance } from "vitest";
import { renderWithProviders } from "../../../test/render";
import { server } from "../../../test/server";
import { mockEndpoint } from "../../../test/mockEndpoint";
import EditBlog, { type EditableBlog } from "./EditBlog";

vi.mock("../../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

type QuillStubProps = {
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
};

// the rich-text editor cannot run in jsdom: a textarea reporting its value the same way
vi.mock("react-quill", async () => {
  const { createElement } = await import("react");
  return {
    default: ({ value, placeholder, onChange }: QuillStubProps) =>
      createElement("textarea", {
        "aria-label": "Nội dung bài viết",
        placeholder,
        value,
        onChange: (event: ChangeEvent<HTMLTextAreaElement>) =>
          onChange?.(event.target.value),
      }),
  };
});

const blog = (overrides: Partial<EditableBlog> = {}): EditableBlog => ({
  id: "b1",
  title: "Mẹo chụp ảnh",
  status: "ENABLED",
  content: "<p>Nội dung cũ</p>",
  thumbnail: "https://cdn.test/b1.jpg",
  ...overrides,
});

const setup = (selected: EditableBlog = blog()) => {
  const onClose = vi.fn();
  const tableRef = vi.fn();
  const view = renderWithProviders(
    <EditBlog selectedUpgrede={selected} onClose={onClose} tableRef={tableRef} />,
  );
  return { ...view, onClose, tableRef };
};

const editor = () => screen.getByLabelText("Nội dung bài viết");

const submit = () =>
  userEvent.click(screen.getByRole("button", { name: "Cập nhật" }));

const pickThumbnail = async (container: HTMLElement) => {
  // antd also posts the picked file to its (empty) upload action
  server.use(http.post("*", () => HttpResponse.json({})));
  await userEvent.upload(
    container.querySelector('input[type="file"]') as HTMLInputElement,
    new File(["img"], "cover.png", { type: "image/png" }),
  );
};

describe("EditBlog", () => {
  let consoleError: MockInstance<typeof console.error>;

  beforeEach(() => {
    // failed saves are logged
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it("saves text changes with a patch and refreshes the table", async () => {
    const requests = mockEndpoint("patch", "*/blog/b1", {});
    const { onClose, tableRef } = setup();

    expect(screen.getByPlaceholderText("Tên bài viết")).toHaveValue("Mẹo chụp ảnh");
    expect(editor()).toHaveValue("<p>Nội dung cũ</p>");
    expect(screen.getByAltText("avatar")).toHaveAttribute(
      "src",
      "https://cdn.test/b1.jpg",
    );
    await userEvent.clear(screen.getByPlaceholderText("Tên bài viết"));
    await userEvent.type(screen.getByPlaceholderText("Tên bài viết"), "Mẹo mới");
    await userEvent.clear(editor());
    await userEvent.type(editor(), "<p>Nội dung mới</p>");
    await submit();

    expect(await screen.findByText("Đã cập nhật")).toBeInTheDocument();
    expect(onClose).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(tableRef).toHaveBeenCalledTimes(1));
    expect(requests).toEqual([
      expect.objectContaining({
        method: "PATCH",
        path: "/blog/b1",
        json: {
          title: "Mẹo mới",
          content: "<p>Nội dung mới</p>",
          status: "ENABLED",
        },
      }),
    ]);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("uploads a new thumbnail with a put and refreshes the table", async () => {
    const requests = mockEndpoint("put", "*/blog/b1", {});
    const { container, onClose, tableRef } = setup();

    await pickThumbnail(container);
    await submit();

    await waitFor(() => expect(requests).toHaveLength(1));
    const form = requests[0].form as FormData;
    expect(requests[0].path).toBe("/blog/b1");
    expect((form.get("thumbnailFile") as File).name).toBe("cover.png");
    expect(form.get("title")).toBe("Mẹo chụp ảnh");
    expect(form.get("content")).toBe("<p>Nội dung cũ</p>");
    expect(form.get("status")).toBe("ENABLED");
    expect(await screen.findByText("Đã cập nhật")).toBeInTheDocument();
    expect(onClose).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(tableRef).toHaveBeenCalledTimes(1));
  });

  it("requires content", async () => {
    setup(blog({ content: undefined }));

    expect(editor()).toHaveValue("");
    await submit();
    expect(
      await screen.findByText("Vui lòng nhập nội dung bài viết."),
    ).toBeInTheDocument();

    // an empty Quill paragraph counts as no content; nothing is sent
    await userEvent.type(editor(), "<p><br></p>");
    await submit();
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.getByText("Vui lòng nhập nội dung bài viết.")).toBeInTheDocument();
    expect(screen.queryByText("Không thành công")).toBeNull();
  });

  it("requires a title", async () => {
    setup();

    await userEvent.clear(screen.getByPlaceholderText("Tên bài viết"));
    await submit();

    expect(await screen.findByText("Vui lòng nhập tên blog")).toBeInTheDocument();
  });

  it("reports a failed patch", async () => {
    server.use(
      http.patch("*/blog/b1", () => new HttpResponse(null, { status: 500 })),
    );
    const { onClose } = setup();

    await submit();

    expect(await screen.findByText("Vui lòng thử lại")).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Cập nhật" })).toBeEnabled();
  });

  it("reports a failed upload and shows progress while saving", async () => {
    let fail = () => {};
    const failed = new Promise<void>((resolve) => {
      fail = resolve;
    });
    server.use(
      http.put("*/blog/b1", async () => {
        await failed;
        return new HttpResponse(null, { status: 500 });
      }),
    );
    const { container, tableRef } = setup();

    await pickThumbnail(container);
    await submit();

    expect(
      await screen.findByRole("button", { name: "Đang cập nhật..." }),
    ).toBeDisabled();
    fail();
    expect(await screen.findByText("Vui lòng thử lại")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cập nhật" })).toBeEnabled();
    expect(tableRef).not.toHaveBeenCalled();
  });
});
