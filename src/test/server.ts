import { setupServer } from "msw/node";

// no default handlers: each test declares the API responses it needs with server.use(...)
export const server = setupServer();
