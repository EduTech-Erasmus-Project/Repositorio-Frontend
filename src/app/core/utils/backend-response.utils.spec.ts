import { normalizeCollectionResponse } from "./backend-response.utils";

describe("normalizeCollectionResponse", () => {
  it("normalizes plain arrays", () => {
    const response = normalizeCollectionResponse([{ id: 1 }, { id: 2 }]);

    expect(response.items.length).toBe(2);
    expect(response.total).toBe(2);
    expect(response.hasPreviousPage).toBeFalse();
    expect(response.hasNextPage).toBeFalse();
  });

  it("normalizes paginated responses with results/count", () => {
    const response = normalizeCollectionResponse({
      count: 12,
      pages: 2,
      links: { next: "/page/2", previous: "" },
      results: [{ id: 1 }],
    });

    expect(response.items).toEqual([{ id: 1 }]);
    expect(response.total).toBe(12);
    expect(response.hasPreviousPage).toBeFalse();
    expect(response.hasNextPage).toBeTrue();
  });

  it("normalizes cursor paginated responses", () => {
    const response = normalizeCollectionResponse({
      count: 5,
      next: null,
      previous: "/page/1",
      results: [{ id: 9 }],
    });

    expect(response.items).toEqual([{ id: 9 }]);
    expect(response.total).toBe(5);
    expect(response.hasPreviousPage).toBeTrue();
    expect(response.hasNextPage).toBeFalse();
  });

  it("normalizes legacy Count/value responses", () => {
    const response = normalizeCollectionResponse({
      Count: 3,
      value: [{ id: 4 }, { id: 5 }],
    });

    expect(response.items).toEqual([{ id: 4 }, { id: 5 }]);
    expect(response.total).toBe(3);
  });
});
