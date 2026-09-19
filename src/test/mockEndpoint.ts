import { http, HttpResponse, type JsonBodyType } from "msw";
import { server } from "./server";

type Method = "get" | "post" | "put" | "patch" | "delete";

export type RecordedRequest = {
  method: string;
  path: string;
  query: Record<string, string>;
  headers: Headers;
  // parsed JSON body, undefined when the request had none
  json?: unknown;
  // parsed body of multipart/form-data requests
  form?: FormData;
};

// answers `method path` with `reply` and records every request the API helper sent
export const mockEndpoint = (
  method: Method,
  path: string,
  reply: JsonBodyType | (() => Response) = {},
) => {
  const requests: RecordedRequest[] = [];
  server.use(
    http[method](path, async ({ request }) => {
      const url = new URL(request.url);
      const recorded: RecordedRequest = {
        method: request.method,
        path: url.pathname,
        query: Object.fromEntries(url.searchParams),
        headers: request.headers,
      };
      if (
        request.headers.get("content-type")?.startsWith("multipart/form-data")
      ) {
        recorded.form = await request.formData();
      } else {
        const text = await request.text();
        recorded.json = text ? JSON.parse(text) : undefined;
      }
      requests.push(recorded);
      return typeof reply === "function" ? reply() : HttpResponse.json(reply);
    }),
  );
  return requests;
};
