import PhotoService from "./PhotoService";

const { parse, notify } = vi.hoisted(() => ({
  parse: vi.fn(),
  notify: vi.fn(),
}));

vi.mock("exifr", () => ({ parse }));
vi.mock("../Notification/Notification", () => ({ notificationApi: notify }));

const file = (type: string, content = "abc") =>
  new File([content], "photo", { type });

// a FileReader that answers with a string result, or fails, on the next microtask
const stubFileReader = (outcome: "string" | "error") => {
  class StubReader {
    result: string | null = null;
    onload: (() => void) | null = null;
    onerror: ((event: unknown) => void) | null = null;
    private finish() {
      queueMicrotask(() => {
        if (outcome === "error") {
          this.onerror?.("read failed");
        } else {
          this.result = "abc";
          this.onload?.();
        }
      });
    }
    readAsArrayBuffer() {
      this.finish();
    }
    readAsDataURL() {
      this.finish();
    }
  }
  vi.stubGlobal("FileReader", StubReader);
};

describe("PhotoService", () => {
  beforeEach(() => {
    parse.mockReset();
    notify.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("getExifData", () => {
    it.each(["image/jpeg", "image/png"])(
      "parses %s files with the upload options",
      async (type) => {
        const photo = file(type);
        parse.mockResolvedValue({ Model: "X-T5", ISO: 200 });

        await expect(PhotoService.getExifData(photo)).resolves.toEqual({
          Model: "X-T5",
          ISO: 200,
        });
        expect(parse).toHaveBeenCalledWith(
          photo,
          expect.objectContaining({
            tiff: true,
            ifd0: false,
            exif: true,
            gps: true,
            mergeOutput: true,
          }),
        );
      },
    );

    it("returns null for unsupported formats without parsing", async () => {
      await expect(
        PhotoService.getExifData(file("image/gif")),
      ).resolves.toBeNull();
      expect(parse).not.toHaveBeenCalled();
      expect(notify).not.toHaveBeenCalled();
    });

    it("notifies and returns false when exifr does not recognise the file", async () => {
      parse.mockRejectedValue(new Error("Unknown file format"));

      await expect(
        PhotoService.getExifData(file("image/jpeg")),
      ).resolves.toBe(false);
      expect(notify).toHaveBeenCalledWith(
        "error",
        "Tải ảnh lên thất bại",
        "Ảnh bạn chọn không phải ảnh gốc hợp lệ",
        "",
        0,
        "upload-photo-dragger-error",
      );
    });

    it("returns null for other parse failures", async () => {
      parse.mockRejectedValue("corrupted");

      await expect(
        PhotoService.getExifData(file("image/png")),
      ).resolves.toBeNull();
      expect(notify).not.toHaveBeenCalled();
    });
  });

  describe("validateExifData", () => {
    it("accepts complete EXIF data", () => {
      expect(
        PhotoService.validateExifData({
          Model: "X-T5",
          ISO: 200,
          FNumber: 2.8,
          ShutterSpeedValue: 8,
          ApertureValue: 3,
        }),
      ).toBe(true);
    });

    it("accepts up to two missing fields", () => {
      expect(
        PhotoService.validateExifData({ Model: "X-T5", ISO: 200, FNumber: 2.8 }),
      ).toBe(true);
    });

    it("rejects more than two missing fields", () => {
      expect(PhotoService.validateExifData({ Model: "X-T5", ISO: 0 })).toBe(
        false,
      );
    });
  });

  describe("file readers", () => {
    it("getBase64 reads the file as a data URL", async () => {
      await expect(
        PhotoService.getBase64(file("text/plain")),
      ).resolves.toBe("data:text/plain;base64,YWJj");
    });

    it("getBuffer reads the file bytes", async () => {
      const buffer = await PhotoService.getBuffer(file("text/plain"));

      expect(Array.from(buffer)).toEqual([97, 98, 99]);
    });

    it("convertArrayBufferToObjectUrl creates an object URL typed like the file", async () => {
      const createObjectURL = vi.mocked(URL.createObjectURL);
      createObjectURL.mockClear();

      await expect(
        PhotoService.convertArrayBufferToObjectUrl(file("image/jpeg")),
      ).resolves.toBe("blob:mock");

      const blob = createObjectURL.mock.calls[0][0] as Blob;
      expect(blob.type).toBe("image/jpeg");
      expect(blob.size).toBe(3);
    });

    it("coerces a non-buffer reader result like the browser types do", async () => {
      stubFileReader("string");
      const createObjectURL = vi.mocked(URL.createObjectURL);
      createObjectURL.mockClear();

      await expect(PhotoService.getBuffer(file("text/plain"))).resolves.toEqual(
        new Uint8Array(0),
      );
      await PhotoService.convertArrayBufferToObjectUrl(file("image/png"));

      const blob = createObjectURL.mock.calls[0][0] as Blob;
      expect(blob.size).toBe(3);
    });

    it.each([
      ["getBase64", PhotoService.getBase64],
      ["getBuffer", PhotoService.getBuffer],
      ["convertArrayBufferToObjectUrl", PhotoService.convertArrayBufferToObjectUrl],
    ] as const)("%s rejects when reading fails", async (_name, read) => {
      stubFileReader("error");

      await expect(read(file("text/plain"))).rejects.toBe("read failed");
    });
  });
});
