import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { useState } from "react";
import type { RcFile } from "antd/es/upload";
import type { MockInstance } from "vitest";
import { createTestQueryClient, renderWithProviders } from "../../../test/render";
import { server } from "../../../test/server";
import { mockEndpoint } from "../../../test/mockEndpoint";
import ShowcasesField, { type ShowcaseItem } from "./ShowcasesField";

vi.mock("../../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const ADD_URL = "*/photographer/photoshoot-package-showcase/photoshoot-package/:id";
const DELETE_URL =
  "*/photographer/photoshoot-package-showcase/:showcaseId/photoshoot-package/:packageId";

type HarnessProps = {
  initialUrls: ShowcaseItem[];
  initialFiles?: RcFile[];
};

// holds the showcase state the way UpdatePhotoshootPackage does
const Harness = ({ initialUrls, initialFiles = [] }: HarnessProps) => {
  const [showcases, setShowcases] = useState<RcFile[]>(initialFiles);
  const [showcasesUrl, setShowcasesUrl] = useState(initialUrls);
  return (
    <>
      <ShowcasesField
        photoshootPackageId="pk1"
        showcases={showcases}
        setShowcases={setShowcases}
        showcasesUrl={showcasesUrl}
        setShowcasesUrl={setShowcasesUrl}
      />
      <output>new files: {showcases.map((file) => file.name).join(",")}</output>
    </>
  );
};

const saved = (count: number): ShowcaseItem[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `s${i + 1}`,
    photoUrl: `https://cdn.test/s${i + 1}.jpg`,
  }));

const fileInput = (container: HTMLElement) =>
  container.querySelector<HTMLInputElement>('input[type="file"]') as HTMLInputElement;

const placeholders = (container: HTMLElement) =>
  container.querySelectorAll(".bg-\\[\\#767676\\]");

const confirmDelete = async (index: number) => {
  const showcase = screen.getByAltText(`Showcase ${index + 1}`).parentElement as HTMLElement;
  await userEvent.click(within(showcase).getByRole("button"));
  await userEvent.click(await screen.findByRole("button", { name: "Xóa" }));
};

describe("ShowcasesField", () => {
  let consoleError: MockInstance<typeof console.error>;
  let consoleLog: MockInstance<typeof console.log>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    // antd's tooltip falls back to the deprecated findDOMNode around the upload
    const unexpected = consoleError.mock.calls
      .map((args) => args.map(String).join(" "))
      .filter((message) => !message.includes("deprecated"));
    consoleError.mockRestore();
    consoleLog.mockRestore();
    expect(unexpected.join("\n")).toBe("");
  });

  it("uploads a picked photo and shows it in the collection", async () => {
    const added = mockEndpoint("post", ADD_URL, {
      id: "s9",
      photoUrl: "https://cdn.test/s9.jpg",
    });
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(["findAllPhotoshootPackages", 1, "desc"], {});
    const { container } = renderWithProviders(<Harness initialUrls={saved(1)} />, {
      queryClient,
    });

    expect(screen.getByAltText("Showcase 1")).toHaveAttribute(
      "src",
      "https://cdn.test/s1.jpg",
    );
    expect(placeholders(container)).toHaveLength(19);

    const file = new File(["image"], "new.png", { type: "image/png" });
    await userEvent.upload(fileInput(container), file);

    expect(await screen.findByAltText("Showcase 2")).toHaveAttribute(
      "src",
      "blob:mock",
    );
    expect(screen.getByText("new files: new.png")).toBeInTheDocument();
    expect(placeholders(container)).toHaveLength(18);
    expect(added).toHaveLength(1);
    expect(added[0].path).toMatch(/\/photoshoot-package\/pk1$/);
    expect(added[0].form?.get("showcase")).toMatchObject({ name: "new.png" });
    expect(consoleLog).toHaveBeenCalledWith("uploading");
    expect(
      queryClient.getQueryState(["findAllPhotoshootPackages", 1, "desc"])
        ?.isInvalidated,
    ).toBe(true);
  });

  it("warns instead of adding photos past 20", async () => {
    mockEndpoint("post", ADD_URL, { id: "s21", photoUrl: "" });
    const { container } = renderWithProviders(<Harness initialUrls={saved(20)} />);
    expect(placeholders(container)).toHaveLength(0);

    await userEvent.upload(
      fileInput(container),
      new File(["image"], "extra.png", { type: "image/png" }),
    );

    expect(
      (await screen.findAllByText("Đã đạt giới hạn ảnh cho bộ sưu tập"))[0],
    ).toBeInTheDocument();
    expect(screen.queryByAltText("Showcase 21")).toBeNull();
    expect(screen.getByText("new files:")).toBeInTheDocument();
  });

  it("keeps the collection when the upload fails", async () => {
    let attempts = 0;
    server.use(
      http.post(ADD_URL, () => {
        attempts += 1;
        return new HttpResponse(null, { status: 500 });
      }),
    );
    const { container } = renderWithProviders(<Harness initialUrls={saved(1)} />);

    await userEvent.upload(
      fileInput(container),
      new File(["image"], "broken.png", { type: "image/png" }),
    );

    await waitFor(() =>
      expect(consoleLog).toHaveBeenCalledWith(
        "Error in customRequest",
        expect.anything(),
      ),
    );
    expect(attempts).toBe(1);
    // the API helper logs the failed request too
    expect(consoleError).toHaveBeenCalledWith(
      "Error adding showcase photo:",
      expect.anything(),
    );
    consoleError.mockClear();
    expect(screen.queryByAltText("Showcase 2")).toBeNull();
    expect(screen.getByText("new files:")).toBeInTheDocument();
  });

  it("logs an uploaded photo whose preview cannot be read", async () => {
    mockEndpoint("post", ADD_URL, { id: "s9", photoUrl: "" });
    // PhotoService assigns onerror right after starting the read; the upload body streams
    // the same file through a load listener (no onerror), which keeps reading normally
    const readAsArrayBuffer = FileReader.prototype.readAsArrayBuffer;
    const reads = vi
      .spyOn(FileReader.prototype, "readAsArrayBuffer")
      .mockImplementation(function (this: FileReader, blob: Blob) {
        queueMicrotask(() => {
          const { onerror } = this;
          if (onerror && blob instanceof File && blob.name.startsWith("broken")) {
            onerror.call(this, new ProgressEvent("error") as ProgressEvent<FileReader>);
            return;
          }
          readAsArrayBuffer.call(this, blob);
        });
      });
    const { container } = renderWithProviders(<Harness initialUrls={saved(1)} />);

    await userEvent.upload(
      fileInput(container),
      new File(["image"], "broken.png", { type: "image/png" }),
    );

    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith(
        "Error in onShowcasesChange:",
        expect.objectContaining({ type: "error" }),
      ),
    );
    consoleError.mockClear();
    // the file is queued before its preview is read, so only the preview is missing
    expect(screen.getByText("new files: broken.png")).toBeInTheDocument();
    expect(screen.queryByAltText("Showcase 2")).toBeNull();
    reads.mockRestore();
  });

  it("stops new uploads once 20 photos were added", () => {
    const files = Array.from(
      { length: 20 },
      (_, i) => new File(["image"], `f${i}.png`, { type: "image/png" }) as RcFile,
    );
    const { container } = renderWithProviders(
      <Harness initialUrls={[]} initialFiles={files} />,
    );

    expect(fileInput(container)).toBeDisabled();
    expect(placeholders(container)).toHaveLength(20);
  });

  it("deletes a saved photo after confirmation", async () => {
    const deletes = mockEndpoint("delete", DELETE_URL, {});
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(
      ["photoshoot-package-showcases-by-photographer", "pk1"],
      {},
    );
    renderWithProviders(<Harness initialUrls={saved(2)} />, { queryClient });

    await confirmDelete(0);

    await waitFor(() => expect(screen.queryByAltText("Showcase 2")).toBeNull());
    expect(screen.getByAltText("Showcase 1")).toHaveAttribute(
      "src",
      "https://cdn.test/s2.jpg",
    );
    expect(deletes).toHaveLength(1);
    expect(deletes[0].path).toMatch(
      /\/photoshoot-package-showcase\/s1\/photoshoot-package\/pk1$/,
    );
    expect(
      queryClient.getQueryState([
        "photoshoot-package-showcases-by-photographer",
        "pk1",
      ])?.isInvalidated,
    ).toBe(true);
  });

  it("keeps the photo and notifies when the deletion fails", async () => {
    server.use(http.delete(DELETE_URL, () => new HttpResponse(null, { status: 500 })));
    renderWithProviders(<Harness initialUrls={saved(2)} />);

    await confirmDelete(1);

    expect(
      await screen.findByText("Cập nhật gói chụp thất bại"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith(
        "Error deleting showcase:",
        expect.anything(),
      ),
    );
    consoleError.mockClear();
    expect(screen.getByAltText("Showcase 2")).toBeInTheDocument();
  });

  it("does not delete a photo that was never saved", async () => {
    const deletes = mockEndpoint("delete", DELETE_URL, {});
    renderWithProviders(
      <Harness initialUrls={[{ photoUrl: "blob:unsaved" }]} />,
    );

    await confirmDelete(0);

    await waitFor(() => expect(consoleLog).toHaveBeenCalledWith("Not found id"));
    expect(deletes).toHaveLength(0);
    expect(screen.getByAltText("Showcase 1")).toBeInTheDocument();
  });
});
