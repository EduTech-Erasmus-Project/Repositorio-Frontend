import { PrettyprintPipe } from "./prettyprint.pipe";

describe("PrettyprintPipe", () => {
  let pipe: PrettyprintPipe;

  beforeEach(() => {
    pipe = new PrettyprintPipe();
  });

  it("debe convertir un objeto a JSON legible como texto plano", () => {
    const result = pipe.transform({
      name: "ROA",
      count: 2,
    });

    expect(result).toContain('"name": "ROA"');
    expect(result).toContain("\n");
    expect(result).toContain("    ");
  });
});
