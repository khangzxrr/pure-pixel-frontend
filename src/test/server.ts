import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

// each test declares the API responses it needs with server.use(...);
// the only default is the feature flags every layout reads (all features on), override it per test
export const server = setupServer(
  http.get("*/feature-flags", () => HttpResponse.json({ booking: true })),
);
