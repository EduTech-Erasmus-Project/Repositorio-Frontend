import { isOwnLearningObject } from "./learning-object-owner.utils";

describe("isOwnLearningObject", () => {
  it("debe reconocer el OA subido por el usuario de la sesion", () => {
    expect(isOwnLearningObject({ user_created: { id: 7 } }, { id: 7 })).toBeTrue();
  });

  it("debe rechazar el OA de otro autor", () => {
    expect(isOwnLearningObject({ user_created: { id: 7 } }, { id: 8 })).toBeFalse();
  });

  it("no debe confundir datos faltantes con autoria", () => {
    expect(isOwnLearningObject({ user_created: null }, { id: 7 })).toBeFalse();
    expect(isOwnLearningObject({ user_created: {} }, {})).toBeFalse();
    expect(isOwnLearningObject({ user_created: { id: 7 } }, null)).toBeFalse();
    expect(isOwnLearningObject(null, { id: 7 })).toBeFalse();
  });
});
