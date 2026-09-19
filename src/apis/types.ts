import type { components, operations } from "./generated/schema";

// Types generated from the backend OpenAPI document.
// Regenerate after backend DTO changes: `npm run openapi:generate` in pure-pixel-backend, then `yarn api:generate` here.

export type Schemas = components["schemas"];

// a DTO by schema name, e.g. Schema<"PhotoDto">
export type Schema<Name extends keyof Schemas> = Schemas[Name];

export type OperationId = keyof operations;

type SuccessStatus = 200 | 201 | 202;

type SuccessResponse<Op extends OperationId> =
  operations[Op]["responses"][Extract<
    keyof operations[Op]["responses"],
    SuccessStatus
  >];

// body of a successful response, e.g. ResponseOf<"ChangeLogController_findPublished">;
// undefined for operations that answer without a body
export type ResponseOf<Op extends OperationId> =
  SuccessResponse<Op> extends { content: infer Content }
    ? Content[keyof Content]
    : undefined;

type Defined<T> = [T] extends [never] ? never : NonNullable<T>;

// query string parameters of an operation
export type QueryOf<Op extends OperationId> = Defined<
  operations[Op]["parameters"]["query"]
>;

// path parameters of an operation
export type PathOf<Op extends OperationId> = Defined<
  operations[Op]["parameters"]["path"]
>;

// request body of an operation (JSON or multipart form fields)
export type BodyOf<Op extends OperationId> =
  Defined<operations[Op]["requestBody"]> extends { content: infer Content }
    ? Content[keyof Content]
    : never;
