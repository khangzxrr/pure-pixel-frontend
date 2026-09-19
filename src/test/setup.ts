import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { server } from "./server";

// antd and several layouts use browser APIs that jsdom does not implement
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

class IntersectionObserverStub {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: ReadonlyArray<number> = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

globalThis.ResizeObserver =
  ResizeObserverStub as unknown as typeof ResizeObserver;
globalThis.IntersectionObserver =
  IntersectionObserverStub as unknown as typeof IntersectionObserver;
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
// antd's scroll locker measures a pseudo-element, which jsdom logs as not implemented
const jsdomGetComputedStyle = window.getComputedStyle.bind(window);
window.getComputedStyle = (element: Element) => jsdomGetComputedStyle(element);
URL.createObjectURL = vi.fn(() => "blob:mock");
URL.revokeObjectURL = vi.fn();
// jsdom's Blob cannot be streamed, which MSW needs to serialize multipart bodies holding files
Object.assign(Blob.prototype, {
  stream(this: Blob) {
    return new ReadableStream<Uint8Array>({
      start: (controller) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
          controller.enqueue(new Uint8Array(reader.result as ArrayBuffer));
          controller.close();
        });
        reader.readAsArrayBuffer(this);
      },
    });
  },
});

// any request a test did not mock fails loudly instead of reaching the network
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => server.close());
