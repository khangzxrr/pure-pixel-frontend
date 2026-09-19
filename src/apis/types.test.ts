import type { BodyOf, PathOf, QueryOf, ResponseOf, Schema } from "./types";

// compile-time checks: `yarn typecheck` fails if the helpers stop resolving generated types
describe("generated API type helpers", () => {
  it("resolve schemas, responses, queries, paths and bodies", () => {
    expectTypeOf<Schema<"ChangeLogDto">["publishedAt"]>().toEqualTypeOf<
      string | null
    >();

    expectTypeOf<
      ResponseOf<"ChangeLogController_findPublished">["objects"]
    >().toMatchTypeOf<Schema<"ChangeLogDto">[]>();
    expectTypeOf<
      ResponseOf<"ChangeLogController_findPublished">["totalPage"]
    >().toEqualTypeOf<number>();
    expectTypeOf<
      ResponseOf<"ChangeLogController_create">
    >().toEqualTypeOf<Schema<"ChangeLogDto">>();

    expectTypeOf<
      QueryOf<"ChangeLogController_findPublished">["limit"]
    >().toEqualTypeOf<number>();
    expectTypeOf<
      PathOf<"ChangeLogController_updateById">
    >().toHaveProperty("id");
    expectTypeOf<BodyOf<"ChangeLogController_create">>().toEqualTypeOf<
      Schema<"ChangeLogCreateRequestDto">
    >();
    expectTypeOf<BodyOf<"ChangeLogController_findPublished">>().toBeNever();
    expectTypeOf<QueryOf<"ChangeLogController_create">>().toBeNever();
  });
});
