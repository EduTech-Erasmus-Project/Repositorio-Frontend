import { UpperCapilPipeComponent } from "./upper.capilal.pipe";

describe("UpperCapilPipeComponent", () => {
  let pipe: UpperCapilPipeComponent;

  beforeEach(() => {
    pipe = new UpperCapilPipeComponent();
  });

  it("debe capitalizar la primera letra y poner el resto en minusculas", () => {
    expect(pipe.transform("tEaChEr")).toBe("Teacher");
  });

  it("debe devolver el mismo valor si no recibe texto", () => {
    expect(pipe.transform(null as any)).toBeNull();
  });
});
