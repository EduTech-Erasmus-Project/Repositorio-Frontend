import { SecurityContext } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { DomSanitizer } from "@angular/platform-browser";
import { UrlsanitizerPipe } from "./urlsanitizer.pipe";

describe("UrlsanitizerPipe", () => {
  let pipe: UrlsanitizerPipe;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UrlsanitizerPipe],
    });

    pipe = TestBed.inject(UrlsanitizerPipe);
    sanitizer = TestBed.inject(DomSanitizer);
  });

  it("debe retornar una url segura para recursos", () => {
    const safeUrl = pipe.transform("http://localhost:8000/index.html");

    expect(
      sanitizer.sanitize(SecurityContext.RESOURCE_URL, safeUrl)
    ).toBe("http://localhost:8000/index.html");
  });
});
