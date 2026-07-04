import { expect, test } from "vitest";
import { formatBytes } from "./format";

test("formatBytes formats bytes correctly", () => {
  expect(formatBytes(0)).toBe("0 Bytes");
  expect(formatBytes(512)).toBe("512 Bytes");
  expect(formatBytes(1024)).toBe("1 KB");
  expect(formatBytes(1048576)).toBe("1 MB");
  expect(formatBytes(1572864)).toBe("1.5 MB");
});
