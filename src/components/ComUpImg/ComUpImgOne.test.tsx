import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "../../test/server";
import ComUpImgOne from "./ComUpImgOne";

const fileInput = (container: HTMLElement) =>
  container.querySelector<HTMLInputElement>('input[type="file"]');

describe("ComUpImgOne", () => {
  it("passes the picked image on and previews it", async () => {
    // antd posts the file to the (empty) upload action
    server.use(http.post("*", () => HttpResponse.json({})));
    const onChange = vi.fn();
    const { container } = render(
      <ComUpImgOne
        onChange={onChange}
        label="Hình ảnh Blog"
        required
        inputId="blog-image"
      />,
    );

    expect(screen.getByText("*")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Hình ảnh/ })).toBeInTheDocument();
    const input = fileInput(container);
    expect(input).toHaveAttribute("accept", ".jpg,.jpeg,.png,.gif,.webp");

    const file = new File(["image"], "photo.png", { type: "image/png" });
    await userEvent.upload(input as HTMLInputElement, file);

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(onChange.mock.calls[0][0]).toMatchObject({ name: "photo.png" });
    expect(await screen.findByAltText("avatar")).toHaveAttribute(
      "src",
      expect.stringMatching(/^data:image\/png;base64,/),
    );
  });

  it("shows the given image and clears it on reset", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <ComUpImgOne onChange={onChange} imgUrl="https://cdn.test/a.jpg" />,
    );
    expect(screen.getByAltText("avatar")).toHaveAttribute(
      "src",
      "https://cdn.test/a.jpg",
    );

    rerender(
      <ComUpImgOne onChange={onChange} imgUrl="https://cdn.test/a.jpg" reset />,
    );
    expect(screen.queryByAltText("avatar")).toBeNull();
    expect(screen.getByRole("button", { name: /Hình ảnh/ })).toBeInTheDocument();
  });

  it("clears the preview when the image url is removed", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <ComUpImgOne onChange={onChange} imgUrl="https://cdn.test/a.jpg" />,
    );
    rerender(<ComUpImgOne onChange={onChange} />);
    expect(screen.queryByAltText("avatar")).toBeNull();
    expect(screen.queryByText("*")).toBeNull();
  });
});
