const { io, socket } = vi.hoisted(() => {
  const socket = {
    on: vi.fn((_event: string, _handler: () => void) => undefined),
    emit: vi.fn((_event: string) => undefined),
  };
  return { socket, io: vi.fn(() => socket) };
});

vi.mock("socket.io-client", () => ({ io }));

import useNotificationStore from "./UseNotificationStore";

const initialState = useNotificationStore.getState();

const handlerFor = (event: string) => {
  const call = socket.on.mock.calls.find(([name]) => name === event);
  if (!call) throw new Error(`no ${event} handler`);
  return call[1];
};

describe("useNotificationStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useNotificationStore.setState(initialState, true);
  });

  it("starts with a new notification badge, closed modal and no socket", () => {
    const state = useNotificationStore.getState();
    expect(state.isNewNotification).toBe(true);
    expect(state.isNotificationOpen).toBe(false);
    expect(state.socket).toBeNull();
  });

  it("toggleNotificationModal opens and closes the modal", () => {
    useNotificationStore.getState().toggleNotificationModal();
    expect(useNotificationStore.getState().isNotificationOpen).toBe(true);
    useNotificationStore.getState().toggleNotificationModal();
    expect(useNotificationStore.getState().isNotificationOpen).toBe(false);
  });

  it("closeNotificationModal closes the modal", () => {
    useNotificationStore.setState({ isNotificationOpen: true });
    useNotificationStore.getState().closeNotificationModal();
    expect(useNotificationStore.getState().isNotificationOpen).toBe(false);
  });

  it("setIsNotification stores the badge flag", () => {
    useNotificationStore.getState().setIsNotification(false);
    expect(useNotificationStore.getState().isNewNotification).toBe(false);
  });

  it("initSocket connects with the bearer token and stores the socket", () => {
    useNotificationStore.getState().initSocket("token-1");

    expect(io).toHaveBeenCalledWith(
      `${import.meta.env.VITE_AXIOS_BASE_URL}/notification`,
      {
        autoConnect: true,
        transports: ["websocket"],
        auth: { token: "bearer token-1" },
      }
    );
    expect(useNotificationStore.getState().socket).toBe(socket);
  });

  it("joins the notification room once connected and ignores disconnects", () => {
    useNotificationStore.getState().initSocket("token-1");

    handlerFor("connect")();
    expect(socket.emit).toHaveBeenCalledWith("join-notification-room");

    handlerFor("disconnect")();
    expect(socket.emit).toHaveBeenCalledTimes(1);
  });
});
