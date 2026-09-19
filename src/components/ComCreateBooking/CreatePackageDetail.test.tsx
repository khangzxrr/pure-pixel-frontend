import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "../../test/server";
import CreatePackageDetail from "./CreatePackageDetail";

type EditorStub = { changed: boolean };

// the rich text editor cannot run in jsdom
vi.mock("draft-js", () => ({
  EditorState: { createEmpty: () => ({ changed: false }) },
}));

vi.mock("react-draft-wysiwyg", () => ({
  Editor: ({
    editorState,
    onEditorStateChange,
    placeholder,
  }: {
    editorState: EditorStub;
    onEditorStateChange: (state: EditorStub) => void;
    placeholder: string;
  }) => (
    <button onClick={() => onEditorStateChange({ changed: true })}>
      {placeholder} {editorState.changed ? "đã sửa" : "trống"}
    </button>
  ),
}));

const uploadUrl = "https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload";

const fileInput = (container: HTMLElement) =>
  container.querySelector<HTMLInputElement>('input[type="file"]') as HTMLInputElement;

describe("CreatePackageDetail", () => {
  it("renders the package form and keeps the editor state", async () => {
    render(<CreatePackageDetail />);

    expect(screen.getByPlaceholderText("Nhập tên gói")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Nhập giá gói đơn vị VNĐ"),
    ).toHaveAttribute("type", "number");
    expect(screen.getByRole("button", { name: "Tạo gói" })).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Nhập mô tả chi tiết gói trống" }),
    );
    expect(
      screen.getByRole("button", { name: "Nhập mô tả chi tiết gói đã sửa" }),
    ).toBeInTheDocument();
  });

  it("uploads the thumbnail to the mock endpoint", async () => {
    server.use(http.post(uploadUrl, () => HttpResponse.json({})));
    const { container } = render(<CreatePackageDetail />);

    await userEvent.upload(
      fileInput(container),
      new File(["image"], "thumb.png", { type: "image/png" }),
    );

    expect(
      await screen.findByText("thumb.png file uploaded successfully."),
    ).toBeInTheDocument();
  });

  it("reports a failed upload", async () => {
    server.use(
      http.post(uploadUrl, () => HttpResponse.json({}, { status: 500 })),
    );
    const { container } = render(<CreatePackageDetail />);

    await userEvent.upload(
      fileInput(container),
      new File(["image"], "broken.png", { type: "image/png" }),
    );

    expect(
      await screen.findByText("broken.png file upload failed."),
    ).toBeInTheDocument();
  });

  it("accepts files dropped on the dragger", () => {
    const { container } = render(<CreatePackageDetail />);
    const dragger = container.querySelector(".ant-upload-drag") as HTMLElement;

    fireEvent.dragOver(dragger);
    expect(dragger).toHaveClass("ant-upload-drag-hover");

    fireEvent.drop(dragger, { dataTransfer: { files: [], items: [] } });
    expect(dragger).not.toHaveClass("ant-upload-drag-hover");
  });
});
