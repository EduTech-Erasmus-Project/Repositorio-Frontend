import { NoimagePipe } from "./noimage.pipe";

describe("NoimagePipe", () => {
  let pipe: NoimagePipe;

  beforeEach(() => {
    pipe = new NoimagePipe();
  });

  it("debe devolver la imagen por defecto cuando no recibe valor", () => {
    expect(pipe.transform(null)).toBe("assets/img/noimage.png");
  });

  it("debe devolver la imagen cuando recibe un objeto con longitud e imagen", () => {
    expect(
      pipe.transform({
        length: 1,
        image: "http://localhost:8000/media/avatar.png",
      })
    ).toBe("http://localhost:8000/media/avatar.png");
  });

  it("debe devolver la imagen por defecto cuando la longitud es cero", () => {
    expect(
      pipe.transform({
        length: 0,
        image: "http://localhost:8000/media/avatar.png",
      })
    ).toBe("assets/img/noimage.png");
  });
});
