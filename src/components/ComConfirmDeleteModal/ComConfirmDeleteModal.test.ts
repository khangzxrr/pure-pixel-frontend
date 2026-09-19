import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "antd";
import { http, HttpResponse } from "msw";
import { server } from "../../test/server";
import ComConfirmDeleteModal from "./ComConfirmDeleteModal";

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const open = (put?: boolean) => {
  const callbacks = { onSuccess: vi.fn(), oke: vi.fn(), failed: vi.fn() };
  act(() => {
    void ComConfirmDeleteModal(
      "/blog",
      "1",
      "Bạn có chắc chắn muốn xóa?",
      callbacks.onSuccess,
      callbacks.oke,
      callbacks.failed,
      put,
    );
  });
  return callbacks;
};

describe("ComConfirmDeleteModal", () => {
  afterEach(() => {
    act(() => Modal.destroyAll());
  });

  it("deletes the item after confirmation", async () => {
    const deleted = vi.fn();
    server.use(
      http.delete("*/blog/1", () => {
        deleted();
        return HttpResponse.json({});
      }),
    );
    const { onSuccess, oke, failed } = open();

    expect(
      await screen.findByText("Bạn có chắc chắn muốn xóa?"),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Xóa" }));

    await waitFor(() => expect(oke).toHaveBeenCalledTimes(1));
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(failed).not.toHaveBeenCalled();
    expect(deleted).toHaveBeenCalledTimes(1);
  });

  it("marks the item as deleted when put is set", async () => {
    let body: unknown;
    server.use(
      http.put("*/blog/1/change-state", async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({});
      }),
    );
    const { onSuccess, oke } = open(true);

    await userEvent.click(await screen.findByRole("button", { name: "Xóa" }));

    await waitFor(() => expect(oke).toHaveBeenCalledTimes(1));
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(body).toEqual({ state: "Deleted" });
  });

  it.each([false, true])("reports failures (put: %s)", async (put) => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    server.use(
      http.delete("*/blog/1", () => new HttpResponse(null, { status: 500 })),
      http.put(
        "*/blog/1/change-state",
        () => new HttpResponse(null, { status: 500 }),
      ),
    );
    const { onSuccess, oke, failed } = open(put);

    await userEvent.click(await screen.findByRole("button", { name: "Xóa" }));

    await waitFor(() => expect(failed).toHaveBeenCalledTimes(1));
    expect(onSuccess).not.toHaveBeenCalled();
    expect(oke).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith("error", expect.anything());
    log.mockRestore();
  });
});
