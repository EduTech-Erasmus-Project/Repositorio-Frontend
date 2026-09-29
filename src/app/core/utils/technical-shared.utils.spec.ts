import {
  buildPastYearRange,
  buildYearRange,
  extractYear,
  hasValidDateValue,
} from "./date.utils";
import {
  buildTimestampedFileName,
  formatFileSize,
} from "./file.utils";
import {
  coerceEventRelationId,
  coerceFiniteNumber,
  coercePositiveNumber,
  coerceRelationId,
} from "./coercion.utils";
import { safeJsonParse } from "./json.utils";
import { hasText, normalizeText } from "./string.utils";

describe("technical shared utils", () => {
  it("builds reusable year ranges", () => {
    expect(buildYearRange(2020, 2026)).toBe("2020:2026");
    expect(buildPastYearRange(22, 6, new Date("2026-06-15"))).toBe("2004:2020");
  });

  it("extracts valid years", () => {
    expect(extractYear("2026-06-15")).toBe(2026);
    expect(extractYear("invalid")).toBeNull();
    expect(hasValidDateValue("2026-06-15")).toBeTrue();
    expect(hasValidDateValue("invalid")).toBeFalse();
  });

  it("formats file sizes and timestamped names", () => {
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(buildTimestampedFileName("reporte", ".xlsx", 12345)).toBe(
      "reporte_12345.xlsx"
    );
  });

  it("coerces ids and event values safely", () => {
    expect(coerceFiniteNumber("12")).toBe(12);
    expect(coercePositiveNumber(0)).toBeNull();
    expect(coerceRelationId({ id: "7" })).toBe(7);
    expect(coerceEventRelationId({ target: { value: "9" } })).toBe(9);
  });

  it("parses json and normalizes text safely", () => {
    expect(safeJsonParse<number[]>("[1,2,3]", [])).toEqual([1, 2, 3]);
    expect(safeJsonParse<number[]>("bad", [])).toEqual([]);
    expect(normalizeText("  hola  ")).toBe("hola");
    expect(normalizeText("   ", "unknown")).toBe("unknown");
    expect(hasText("  ok ")).toBeTrue();
    expect(hasText("   ")).toBeFalse();
  });
});
