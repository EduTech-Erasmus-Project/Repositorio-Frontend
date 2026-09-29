import { TestBed } from "@angular/core/testing";
import * as moment from "moment";
import { LanguageService } from "../services/language.service";
import { MomentPipe } from "./moment.pipe";

describe("MomentPipe", () => {
  let pipe: MomentPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MomentPipe,
        {
          provide: LanguageService,
          useValue: {},
        },
      ],
    });

    pipe = TestBed.inject(MomentPipe);
    moment.locale("es-us");
  });

  it("debe formatear la fecha relativa usando moment", () => {
    const value = moment().subtract(1, "day").toISOString();

    expect(pipe.transform(value)).toBe(moment(value).startOf("second").fromNow());
  });
});
