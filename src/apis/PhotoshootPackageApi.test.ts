import { mockEndpoint } from "../test/mockEndpoint";
import PhotoshootPackageApi from "./PhotoshootPackageApi";

const convertArrayBufferToObjectUrl = vi.hoisted(() =>
  vi.fn(async () => "blob:preview"),
);

vi.mock("../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

vi.mock("../services/PhotoService", () => ({
  default: { convertArrayBufferToObjectUrl },
}));

const entriesOf = (form: FormData | undefined) =>
  [...(form?.entries() ?? [])].map(([key, value]) => [
    key,
    typeof value === "string" ? value : `file:${value.name}`,
  ]);

const image = (name: string) =>
  new File(["img"], name, { type: "image/jpeg" });

describe("PhotoshootPackageApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("getPackagesByPhotographerId pages through a photographer's packages", async () => {
    const requests = mockEndpoint(
      "get",
      "*/photoshoot-package/photographer/u1",
      { objects: [{ id: "pk1" }], totalPage: 1 },
    );

    await expect(
      PhotoshootPackageApi.getPackagesByPhotographerId("u1", 6, 0),
    ).resolves.toEqual({ objects: [{ id: "pk1" }], totalPage: 1 });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        path: "/photoshoot-package/photographer/u1",
        query: { limit: "6", page: "0" },
      }),
    ]);
  });

  it("findAll sends the sort order when given", async () => {
    const requests = mockEndpoint("get", "*/photoshoot-package", {
      objects: [],
      totalPage: 0,
    });

    await expect(PhotoshootPackageApi.findAll(9, 1, "desc")).resolves.toEqual({
      objects: [],
      totalPage: 0,
    });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        path: "/photoshoot-package",
        query: { limit: "9", page: "1", orderByCreateAt: "desc" },
      }),
    ]);
  });

  it("findAll omits the sort order when missing", async () => {
    const requests = mockEndpoint("get", "*/photoshoot-package");

    await PhotoshootPackageApi.findAll(9, 0);

    expect(requests[0].query).toEqual({ limit: "9", page: "0" });
  });

  it.each([
    ["findById", PhotoshootPackageApi.findById, "get", "/photoshoot-package/pk1"],
    [
      "photographerFindById",
      PhotoshootPackageApi.photographerFindById,
      "get",
      "/photographer/photoshoot-package/pk1",
    ],
    [
      "deletePhotoshootPackage",
      PhotoshootPackageApi.deletePhotoshootPackage,
      "delete",
      "/photographer/photoshoot-package/pk1",
    ],
  ] as const)("%s calls %s %s", async (_name, action, method, path) => {
    const requests = mockEndpoint(method, `*${path}`, { id: "pk1" });

    await expect(action("pk1")).resolves.toEqual({ id: "pk1" });
    expect(requests).toEqual([
      expect.objectContaining({ method: method.toUpperCase(), path }),
    ]);
  });

  it("createPhotoshootPackage posts every provided field and showcase as multipart", async () => {
    const requests = mockEndpoint(
      "post",
      "*/photographer/photoshoot-package/v2",
      { id: "pk1" },
    );

    await expect(
      PhotoshootPackageApi.createPhotoshootPackage({
        title: "Cưới",
        subtitle: "Trọn gói",
        price: 1500000,
        description: "Chụp cả ngày",
        thumbnail: image("thumb.jpg"),
        showcases: [
          { originFileObj: image("s1.jpg") },
          { originFileObj: image("s2.jpg") },
        ],
      }),
    ).resolves.toEqual({ id: "pk1" });

    expect(requests).toHaveLength(1);
    expect(requests[0].method).toBe("POST");
    expect(entriesOf(requests[0].form)).toEqual([
      ["title", "Cưới"],
      ["subtitle", "Trọn gói"],
      ["price", "1500000"],
      ["description", "Chụp cả ngày"],
      ["thumbnail", "file:thumb.jpg"],
      ["showcases[0]", "file:s1.jpg"],
      ["showcases[1]", "file:s2.jpg"],
    ]);
  });

  it.each([
    ["no data", null],
    ["empty fields", { title: "", price: 0, showcases: [] }],
  ])("createPhotoshootPackage skips missing fields (%s)", async (_case, data) => {
    const requests = mockEndpoint(
      "post",
      "*/photographer/photoshoot-package/v2",
      { id: "pk1" },
    );

    await PhotoshootPackageApi.createPhotoshootPackage(data);

    expect(entriesOf(requests[0].form)).toEqual([]);
  });

  it("updatePhotoshootPackage patches every provided field and checks the thumbnail", async () => {
    const requests = mockEndpoint(
      "patch",
      "*/photographer/photoshoot-package/pk1",
      { id: "pk1" },
    );
    const thumbnail = image("thumb.jpg");

    await expect(
      PhotoshootPackageApi.updatePhotoshootPackage({
        packageId: "pk1",
        data: {
          title: "Cưới",
          subtitle: "Trọn gói",
          price: "1500000",
          description: "Chụp cả ngày",
          thumbnail,
        },
      }),
    ).resolves.toEqual({ id: "pk1" });

    expect(convertArrayBufferToObjectUrl).toHaveBeenCalledWith(thumbnail);
    expect(entriesOf(requests[0].form)).toEqual([
      ["title", "Cưới"],
      ["subtitle", "Trọn gói"],
      ["price", "1500000"],
      ["description", "Chụp cả ngày"],
      ["thumbnail", "file:thumb.jpg"],
    ]);
  });

  it("updatePhotoshootPackage logs and skips a thumbnail that is not a file", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const requests = mockEndpoint(
      "patch",
      "*/photographer/photoshoot-package/pk1",
      { id: "pk1" },
    );

    await PhotoshootPackageApi.updatePhotoshootPackage({
      packageId: "pk1",
      data: { thumbnail: "data:image/png;base64,AAAA" as unknown as Blob },
    });

    expect(error).toHaveBeenCalledWith(
      "Thumbnail is neither a valid file, blob, nor base64 string",
    );
    expect(entriesOf(requests[0].form)).toEqual([]);
  });

  it("updatePhotoshootPackage sends an empty form without data", async () => {
    const requests = mockEndpoint(
      "patch",
      "*/photographer/photoshoot-package/pk1",
      { id: "pk1" },
    );

    await PhotoshootPackageApi.updatePhotoshootPackage({ packageId: "pk1" });

    expect(convertArrayBufferToObjectUrl).not.toHaveBeenCalled();
    expect(entriesOf(requests[0].form)).toEqual([]);
  });

  it("getPhotoshootPackageShowcase asks for the first 20 showcases", async () => {
    const requests = mockEndpoint(
      "get",
      "*/photographer/photoshoot-package-showcase/photoshoot-package/pk1",
      { objects: [{ id: "sc1" }], totalPage: 1 },
    );

    await expect(
      PhotoshootPackageApi.getPhotoshootPackageShowcase("pk1"),
    ).resolves.toEqual({ objects: [{ id: "sc1" }], totalPage: 1 });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        query: { limit: "20", page: "0" },
      }),
    ]);
  });

  it("addPhotoshootPackageShowcase posts the photo as multipart", async () => {
    const requests = mockEndpoint(
      "post",
      "*/photographer/photoshoot-package-showcase/photoshoot-package/pk1",
      { id: "sc1" },
    );

    await expect(
      PhotoshootPackageApi.addPhotoshootPackageShowcase("pk1", {
        newShowcasePhoto: image("s1.jpg"),
      }),
    ).resolves.toEqual({ id: "sc1" });
    expect(requests[0].method).toBe("POST");
    expect(entriesOf(requests[0].form)).toEqual([["showcase", "file:s1.jpg"]]);
  });

  it("addPhotoshootPackageShowcase rejects without a photo", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      PhotoshootPackageApi.addPhotoshootPackageShowcase("pk1", {
        newShowcasePhoto: null,
      }),
    ).rejects.toThrow(
      "Invalid file object. Ensure the file is properly selected.",
    );
    expect(error).toHaveBeenCalledWith(
      "Error adding showcase photo:",
      expect.any(Error),
    );
  });

  it("deletePhotoshootPackageShowcase deletes the showcase", async () => {
    const path =
      "/photographer/photoshoot-package-showcase/sc1/photoshoot-package/pk1";
    const requests = mockEndpoint("delete", `*${path}`, true);

    await expect(
      PhotoshootPackageApi.deletePhotoshootPackageShowcase("sc1", "pk1"),
    ).resolves.toBe(true);
    expect(requests).toEqual([
      expect.objectContaining({ method: "DELETE", path }),
    ]);
  });

  it("getAllPhotoshootPackages pages through my packages", async () => {
    const requests = mockEndpoint("get", "*/photographer/photoshoot-package", {
      objects: [],
      totalPage: 0,
    });

    await expect(
      PhotoshootPackageApi.getAllPhotoshootPackages(6, 2, "asc"),
    ).resolves.toEqual({ objects: [], totalPage: 0 });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        path: "/photographer/photoshoot-package",
        query: { limit: "6", page: "2", orderByCreateAt: "asc" },
      }),
    ]);
  });
});
