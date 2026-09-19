import type { ChangeEvent } from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { MockInstance } from "vitest";
import { renderWithProviders } from "../../../test/render";
import { server } from "../../../test/server";
import { mockEndpoint } from "../../../test/mockEndpoint";
import CreateBlog from "./CreateBlog";
import type { TableBlogHandle } from "./TableBlog";

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

const setup = (table: TableBlogHandle | null = { reloadData: vi.fn() }) => {
  const onClose = vi.fn();
  const tableRef = { current: table };
  const view = renderWithProviders(
    <CreateBlog onClose={onClose} tableRef={tableRef} />,
  );
  return { ...view, onClose, table };
};

const submit = () =>
  userEvent.click(screen.getByRole("button", { name: "Tạo mới" }));

const pickThumbnail = async (container: HTMLElement) => {
  // antd also posts the picked file to its (empty) upload action
  server.use(http.post("*", () => HttpResponse.json({})));
  await userEvent.upload(
    container.querySelector('input[type="file"]') as HTMLInputElement,
    new File(["img"], "cover.png", { type: "image/png" }),
  );
  await screen.findByAltText("avatar");
};

const fill = async (container: HTMLElement, content = "<p>Bài viết</p>") => {
  await userEvent.type(screen.getByPlaceholderText("Tên bài viết"), "Mẹo chụp ảnh");
  await pickThumbnail(container);
  if (content) {
    await userEvent.type(screen.getByLabelText("Nội dung bài viết"), content);
  }
};

describe("CreateBlog", () => {
  let consoleError: MockInstance<typeof console.error>;

  beforeEach(() => {
    // failed creations are logged
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it("requires a title", async () => {
    setup();

    expect(screen.getByText("Hình ảnh Blog")).toBeInTheDocument();
    await submit();

    expect(
      await screen.findByText("Vui lòng nhập tên bài viết"),
    ).toBeInTheDocument();
  });

  it("requires an image", async () => {
    setup();

    await userEvent.type(screen.getByPlaceholderText("Tên bài viết"), "Mẹo");
    await submit();

    expect(await screen.findByText("Vui lòng chọn hình ảnh.")).toBeInTheDocument();
  });

  it("requires content, an empty editor paragraph included", async () => {
    const { container } = setup();

    await fill(container, "");
    await submit();
    expect(
      await screen.findByText("Vui lòng nhập nội dung bài viết."),
    ).toBeInTheDocument();

    // an empty Quill paragraph counts as no content; nothing is sent
    await userEvent.type(screen.getByLabelText("Nội dung bài viết"), "<p><br></p>");
    await submit();
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.getByText("Vui lòng nhập nội dung bài viết.")).toBeInTheDocument();
    expect(screen.queryByText("Không thành công")).toBeNull();
  });

  it("creates an enabled blog, closes and reloads the table", async () => {
    let respond = () => {};
    const responded = new Promise<void>((resolve) => {
      respond = resolve;
    });
    const bodies: FormData[] = [];
    const { container, onClose, table } = setup();
    await fill(container);
    // registered after the upload catch-all so it answers the blog request
    server.use(
      http.post("*/blog", async ({ request }) => {
        bodies.push(await request.formData());
        await responded;
        return HttpResponse.json({ id: "b9" });
      }),
    );

    await submit();

    expect(
      await screen.findByRole("button", { name: "Đang tạo..." }),
    ).toBeDisabled();
    respond();
    expect(await screen.findByText("Đã tạo thành công")).toBeInTheDocument();
    expect(onClose).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(table?.reloadData).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("button", { name: "Tạo mới" })).toBeEnabled();

    expect(bodies).toHaveLength(1);
    expect((bodies[0].get("thumbnailFile") as File).name).toBe("cover.png");
    expect(bodies[0].get("title")).toBe("Mẹo chụp ảnh");
    expect(bodies[0].get("content")).toBe("<p>Bài viết</p>");
    expect(bodies[0].get("status")).toBe("ENABLED");
  });

  it("does not reload when the table is gone", async () => {
    const { container, onClose } = setup(null);
    await fill(container);
    const requests = mockEndpoint("post", "*/blog", {});

    await submit();

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(requests).toHaveLength(1);
    await new Promise((resolve) => setTimeout(resolve, 150));
  });

  it("reports a failed creation", async () => {
    const { container, onClose } = setup();
    await fill(container);
    server.use(
      http.post("*/blog", () => new HttpResponse(null, { status: 500 })),
    );

    await submit();

    expect(await screen.findByText("Vui lòng thử lại")).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Tạo mới" })).toBeEnabled();
  });
});
