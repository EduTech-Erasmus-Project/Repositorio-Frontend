import { objectToFormData } from "./form-data.utils";

describe("objectToFormData", () => {
  it("serializa campos escalares y archivos", () => {
    const file = new File(["avatar"], "avatar.png", { type: "image/png" });
    const formData = objectToFormData({
      title: "OA",
      published: true,
      avatar: file,
    });

    expect(formData.get("title")).toBe("OA");
    expect(formData.get("published")).toBe("true");
    expect(formData.get("avatar")).toBe(file);
  });

  it("serializa arreglos y objetos anidados", () => {
    const formData = objectToFormData({
      tags: [1, 2],
      learning_object_file: { id: 99 },
    });

    expect(formData.getAll("tags[]")).toEqual(["1", "2"]);
    expect(formData.get("learning_object_file[id]")).toBe("99");
  });

  it("omite valores null o undefined", () => {
    const formData = objectToFormData({
      title: "OA",
      optional: null,
      other: undefined,
    });

    expect(formData.get("title")).toBe("OA");
    expect(formData.has("optional")).toBeFalse();
    expect(formData.has("other")).toBeFalse();
  });
});
