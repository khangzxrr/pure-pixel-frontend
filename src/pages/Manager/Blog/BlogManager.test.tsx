import type { ChangeEvent } from "react";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { MockInstance } from "vitest";
import { renderWithProviders } from "../../../test/render";
import { server } from "../../../test/server";
import { mockEndpoint } from "../../../test/mockEndpoint";
import type { Schema } from "../../../apis/types";
import BlogManager from "./BlogManager";

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

// the real menu, plus a button reaching the details action this table hides
vi.mock(
  "../../../components/ComMenuButonTable/ComMenuButonTable",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../../components/ComMenuButonTable/ComMenuButonTable")
      >();
    const { createElement, Fragment } = await import("react");
    type MenuProps = Parameters<typeof actual.default>[0];
    const MenuWithHiddenActions = (props: MenuProps) =>
      createElement(
        Fragment,
        null,
        createElement(actual.default, props),
        createElement(
          "button",
          { type: "button", onClick: () => props.showModalDetails?.(props.record) },
          "hidden details",
        ),
      );
    return { ...actual, default: MenuWithHiddenActions };
  },
);

type Blog = Schema<"BlogDto">;

const createdAt = new Date(2026, 8, 15, 10, 30).toISOString();

const blog = (overrides: Partial<Blog> = {}): Blog => ({
  id: "b1",
  title: "Mẹo chụp ảnh",
  status: "ENABLED",
  content: "<p>Dùng <b>ánh sáng</b> tự nhiên</p>",
  thumbnail: "https://cdn.test/b1.jpg",
  createdAt,
  updatedAt: createdAt,
  ...overrides,
});

const tips = blog();
const news = blog({
  id: "b2",
  title: "Cập nhật tính năng",
  content: "<p>Tính năng mới</p>",
  thumbnail: "https://cdn.test/b2.jpg",
});

const list = (objects: Blog[]) => ({
  objects,
  totalRecord: objects.length,
  totalPage: 1,
});

const rowOf = (text: string) =>
  screen.getByText(text).closest("tr") as HTMLElement;

const titles = () =>
  screen
    .getAllByRole("row")
    .map(
      (row) =>
        within(row).queryByText(/^(Mẹo chụp ảnh|Cập nhật tính năng)$/)
          ?.textContent,
    )
    .filter(Boolean);

const renderLoaded = async () => {
  const requests = mockEndpoint("get", "*/blog", list([tips, news]));
  renderWithProviders(<BlogManager />);
  await screen.findByText("Mẹo chụp ảnh");
  return requests;
};

const choose = async (title: string, action: string) => {
  await userEvent.click(
    within(rowOf(title)).getByRole("button", { name: "ellipsis" }),
  );
  const items = await screen.findAllByRole("menuitem");
  expect(items.map((item) => item.textContent)).toEqual([
    "Cập nhật chỉnh sửa",
    "Xóa",
  ]);
  await userEvent.click(within(items[0].parentElement as HTMLElement).getByText(action));
};

describe("BlogManager", () => {
  let consoleError: MockInstance<typeof console.error>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // antd reports the deprecated APIs the shared menu uses; anything else is unexpected
    const unexpected = consoleError.mock.calls
      .map(([message]) => String(message))
      .filter(
        (message) =>
          !message.includes("deprecated") &&
          !message.startsWith("Error fetching items:"),
      );
    expect(unexpected).toEqual([]);
    consoleError.mockRestore();
  });

  it("lists the newest blogs with thumbnail and content", async () => {
    const requests = await renderLoaded();

    expect(requests[0].query).toEqual({
      limit: "9999",
      page: "0",
      orderByCreatedAt: "desc",
    });
    const first = rowOf("Mẹo chụp ảnh");
    expect(within(first).getByText("b1")).toBeInTheDocument();
    expect(within(first).getByText("ánh sáng").tagName).toBe("B");
    expect(first.querySelector("img.ant-image-img")).toHaveAttribute(
      "src",
      "https://cdn.test/b1.jpg",
    );
  });

  it("creates a blog and reloads the table", async () => {
    const requests = await renderLoaded();
    // antd also posts the picked file to its (empty) upload action
    server.use(http.post("*", () => HttpResponse.json({})));
    const created = mockEndpoint("post", "*/blog", {});

    await userEvent.click(screen.getByRole("button", { name: "+ Tạo mới blog" }));
    expect(await screen.findByText("Tạo blog")).toBeInTheDocument();
    await userEvent.type(screen.getByPlaceholderText("Tên bài viết"), "Blog mới");
    await userEvent.type(
      screen.getByLabelText("Nội dung bài viết"),
      "<p>Xin chào</p>",
    );
    await userEvent.upload(
      document.querySelector('.ant-modal input[type="file"]') as HTMLInputElement,
      new File(["img"], "cover.png", { type: "image/png" }),
    );
    await screen.findByAltText("avatar");
    await userEvent.click(screen.getByRole("button", { name: "Tạo mới" }));

    expect(await screen.findByText("Đã tạo thành công")).toBeInTheDocument();
    expect(created).toHaveLength(1);
    expect(created[0].form?.get("title")).toBe("Blog mới");
    expect(created[0].form?.get("content")).toBe("<p>Xin chào</p>");
    expect(created[0].form?.get("status")).toBe("ENABLED");
    // the create form reloads the table through its ref
    await waitFor(() => expect(requests).toHaveLength(2));
  });

  it("edits a blog from the menu and reloads", async () => {
    const requests = await renderLoaded();
    const patches = mockEndpoint("patch", "*/blog/b2", {});

    await choose("Cập nhật tính năng", "Cập nhật chỉnh sửa");
    expect(await screen.findByText("Cập nhật blog")).toBeInTheDocument();
    const title = screen.getByPlaceholderText("Tên bài viết");
    expect(title).toHaveValue("Cập nhật tính năng");
    await userEvent.type(title, " 2026");
    await userEvent.click(screen.getByRole("button", { name: "Cập nhật" }));

    expect(await screen.findByText("Đã cập nhật")).toBeInTheDocument();
    expect(patches[0].json).toEqual({
      title: "Cập nhật tính năng 2026",
      content: "<p>Tính năng mới</p>",
      status: "ENABLED",
    });
    await waitFor(() => expect(requests).toHaveLength(2));
  });

  it("deletes a blog from the menu and reloads", async () => {
    const requests = await renderLoaded();
    const deletes = mockEndpoint("delete", "*/blog/b1", {});

    await choose("Mẹo chụp ảnh", "Xóa");
    await screen.findByText("Bạn có chắc chắn muốn xóa?");
    await userEvent.click(screen.getByRole("button", { name: "Xóa" }));

    expect(await screen.findByText("Đã xóa blog")).toBeInTheDocument();
    expect(deletes).toEqual([
      expect.objectContaining({ method: "DELETE", path: "/blog/b1" }),
    ]);
    await waitFor(() => expect(requests).toHaveLength(2));
  });

  it("reports a failed delete", async () => {
    await renderLoaded();
    mockEndpoint("delete", "*/blog/b2", () => new HttpResponse(null, { status: 500 }));
    vi.spyOn(console, "log").mockImplementation(() => {});

    await choose("Cập nhật tính năng", "Xóa");
    await userEvent.click(await screen.findByRole("button", { name: "Xóa" }));

    await waitFor(() => expect(screen.getAllByText("Lỗi")).toHaveLength(2));
    vi.mocked(console.log).mockRestore();
  });

  it("keeps the hidden details action and sorts by id and title", async () => {
    await renderLoaded();

    await userEvent.click(within(rowOf("Mẹo chụp ảnh")).getByText("hidden details"));
    expect(await screen.findByText("123")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Tên bài viết"));
    expect(titles()).toEqual(["Cập nhật tính năng", "Mẹo chụp ảnh"]);
    await userEvent.click(screen.getByText("Id"));
    expect(titles()).toEqual(["Mẹo chụp ảnh", "Cập nhật tính năng"]);
  });

  it("logs a failed load", async () => {
    mockEndpoint("get", "*/blog", () => new HttpResponse(null, { status: 500 }));
    renderWithProviders(<BlogManager />);

    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith(
        "Error fetching items:",
        expect.anything(),
      ),
    );
  });
});
