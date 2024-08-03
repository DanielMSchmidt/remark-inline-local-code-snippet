import { describe, it, expect } from "vitest";
import {
  supportedLanguageExtensions,
  pathExtensionToMarkdownLanguageTag,
  commentOutBasedOnLanguage,
} from "../src/index";

describe("Languages", () => {
  describe.each(Object.keys(supportedLanguageExtensions))("supported - %s", (ext) => {
    it("has a markdown mapping", () => {
      expect(pathExtensionToMarkdownLanguageTag(ext)).toMatchSnapshot();
    });
    it("can comment out code", () => {
      expect(commentOutBasedOnLanguage(ext, "code")).toMatchSnapshot();
    });
  });
  describe("unsupported", () => {
    const ext = ".unsupported";
    it("has a markdown mapping", () => {
      expect(pathExtensionToMarkdownLanguageTag(ext)).toMatchSnapshot();
    });
    it("can comment out code", () => {
      expect(commentOutBasedOnLanguage(ext, "code")).toMatchSnapshot();
    });
  });
});
