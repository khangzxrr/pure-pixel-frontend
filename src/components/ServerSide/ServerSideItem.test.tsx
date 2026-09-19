import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/render";
import UseNotificationStore from "../../states/UseNotificationStore";
import UseServerSideStore from "../../states/UseServerSideStore";
import ServerSideItem from "./ServerSideItem";

const icon = <span>icon</span>;

describe("ServerSideItem", () => {
  beforeEach(() => {
    UseServerSideStore.setState({ activeLinkServer: null });
    UseNotificationStore.setState({
      isNotificationOpen: false,
      isNewNotification: true,
    });
  });

  describe("notification toggle", () => {
    it("opens the panel and clears the new dot", async () => {
      const onNotificationClick = vi.fn();
      renderWithProviders(
        <ServerSideItem
          icon={icon}
          name="Thông báo"
          isNotification
          onNotificationClick={onNotificationClick}
        />,
      );
      const item = screen.getByTitle("Thông báo");
      expect(item.querySelector(".bg-red-500")).not.toBeNull();

      await userEvent.click(item);

      expect(onNotificationClick).toHaveBeenCalledTimes(1);
      expect(UseNotificationStore.getState().isNewNotification).toBe(false);
      expect(item.querySelector(".bg-red-500")).toBeNull();
    });

    it("shows its name while hovered", async () => {
      renderWithProviders(
        <ServerSideItem icon={icon} name="Thông báo" isNotification />,
      );
      const item = screen.getByTitle("Thông báo");

      await userEvent.hover(item);
      expect(screen.getByText("Thông báo")).toHaveClass("opacity-100");

      await userEvent.unhover(item);
      expect(screen.queryByText("Thông báo")).toBeNull();
    });

    it("has no tooltip without a name", async () => {
      const { container } = renderWithProviders(
        <ServerSideItem icon={icon} isNotification />,
      );
      await userEvent.hover(screen.getByText("icon"));
      expect(container.querySelector(".whitespace-nowrap")).toBeNull();
    });
  });

  describe("link", () => {
    it("highlights the section the current page belongs to", () => {
      renderWithProviders(
        <ServerSideItem id="explore" icon={icon} name="Khám phá" link="/explore" />,
        { route: "/explore/inspiration" },
      );

      expect(screen.getByTitle("Khám phá")).toHaveClass("bg-gray-500");
      expect(screen.getByTitle("Khám phá")).toHaveAttribute("href", "/explore");
      expect(UseServerSideStore.getState().activeLinkServer).toBeNull();
    });

    it("remembers the link when the page is exactly its route", () => {
      renderWithProviders(
        <ServerSideItem id="policy" icon={icon} name="Chính sách" link="/policy" />,
        { route: "/policy" },
      );

      expect(UseServerSideStore.getState().activeLinkServer).toBe("/policy");
    });

    it("does not highlight other sections", () => {
      renderWithProviders(
        <ServerSideItem id="policy" icon={icon} name="Chính sách" link="/policy" />,
        { route: "/explore" },
      );

      expect(screen.getByTitle("Chính sách")).not.toHaveClass("bg-gray-500");
    });

    it("never highlights the logo", () => {
      renderWithProviders(<ServerSideItem id="logo" icon={icon} link="/" />, {
        route: "/explore",
      });

      expect(screen.getByText("icon").closest("a")).not.toHaveClass(
        "bg-gray-500",
      );
    });

    it("activates the link and closes the notification panel on click", async () => {
      UseNotificationStore.setState({ isNotificationOpen: true });
      renderWithProviders(
        <ServerSideItem id="message" icon={icon} name="Tin nhắn" link="/message" />,
      );

      await userEvent.click(screen.getByTitle("Tin nhắn"));

      expect(UseServerSideStore.getState().activeLinkServer).toBe("/message");
      expect(UseNotificationStore.getState().isNotificationOpen).toBe(false);
    });

    it("shows the badge and a hover tooltip", async () => {
      renderWithProviders(
        <ServerSideItem
          id="changelog"
          icon={icon}
          name="Cập nhật"
          link="/changelog"
          badge
        />,
      );
      const link = screen.getByTitle("Cập nhật");
      expect(link.querySelector(".bg-red-500")).not.toBeNull();

      await userEvent.hover(link);
      expect(screen.getByText("Cập nhật")).toHaveClass("opacity-100");

      await userEvent.unhover(link);
      expect(screen.queryByText("Cập nhật")).toBeNull();
    });

    it("renders nothing for an entry without a link", () => {
      const { container } = renderWithProviders(
        <ServerSideItem id="broken" icon={icon} name="Hỏng" />,
      );
      expect(container).toBeEmptyDOMElement();
    });
  });
});
