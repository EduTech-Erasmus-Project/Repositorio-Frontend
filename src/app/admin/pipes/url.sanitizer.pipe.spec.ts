import { SecurityContext } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { DomSanitizer } from "@angular/platform-browser";
import { UrlSanitizerPipe } from "./url.sanitizer.pipe";

describe("UrlSanitizerPipe", () => {
  let pipe: UrlSanitizerPipe;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UrlSanitizerPipe],
    });

    pipe = TestBed.inject(UrlSanitizerPipe);
    sanitizer = TestBed.inject(DomSanitizer);
  });

  it("debe retornar una url segura para iframes administrativos", () => {
    const safeUrl = pipe.transform("http://localhost:8000/admin/index.html");

    expect(
      sanitizer.sanitize(SecurityContext.RESOURCE_URL, safeUrl)
    ).toBe("http://localhost:8000/admin/index.html");
  });
});
