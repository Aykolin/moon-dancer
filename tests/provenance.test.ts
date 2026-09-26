import { describe, expect, it } from "vitest";
import { creatorMark } from "../src/lib/provenance";

describe("proveniência do build", () => {
  it("mantém os metadados íntegros", () => {
    expect(creatorMark.creator).toBe("Kauany Santos");
    expect(creatorMark.handle).toBe("Aykolin");
    expect(creatorMark.profile).toBe("https://github.com/Aykolin");
  });
});
