import { describe, it, expect } from "vitest";
import { builtInTransforms } from "../lib/text-transforms"; // adjust path if needed

function get(id: string) {
  const t = builtInTransforms.find((x) => x.id === id);
  if (!t) throw new Error(`Missing transform: ${id}`);
  return t;
}

describe("builtInTransforms - schema sanity", () => {
  it("has unique ids", () => {
    const ids = builtInTransforms.map((t) => t.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(dupes).toEqual([]);
  });

  it("each transform has required fields", () => {
    for (const t of builtInTransforms) {
      expect(typeof t.id).toBe("string");
      expect(t.id.length).toBeGreaterThan(0);

      expect(typeof t.name).toBe("string");
      expect(t.name.length).toBeGreaterThan(0);

      expect(typeof t.description).toBe("string");
      expect(t.description.length).toBeGreaterThan(0);

      expect(["cleanup", "case", "format", "remove", "custom"]).toContain(t.category);

      expect(typeof t.icon).toBe("string");
      expect(t.icon.length).toBeGreaterThan(0);

      expect(typeof t.action).toBe("function");
    }
  });
});

describe("transforms - actions", () => {
  // TRIM WHITESPACE TESTS
  describe("trim-whitespace", () => {
    const t = get("trim-whitespace");

    it("trims each line, preserving line count", () => {
      const input = "  hello  \n   world\t\n\n  ok ";
      expect(t.action(input)).toBe("hello\nworld\n\nok");
    });

    it("is idempotent", () => {
      const input = "  hello  \n   world  ";
      expect(t.action(t.action(input))).toBe(t.action(input));
    });

    it("handles empty string", () => {
      expect(t.action("")).toBe("");
    });

    it("handles single line with leading/trailing spaces", () => {
      expect(t.action("   hello world   ")).toBe("hello world");
    });

    it("handles lines with only whitespace (becomes empty)", () => {
      expect(t.action("hello\n   \nworld")).toBe("hello\n\nworld");
    });

    it("preserves internal spaces", () => {
      expect(t.action("  a  b  c  ")).toBe("a  b  c");
    });
  });

  // COLLAPSE SPACES TESTS
  describe("collapse-spaces", () => {
    const t = get("collapse-spaces");

    it("collapses 2+ spaces into 1", () => {
      const input = "a   b\nc    d";
      expect(t.action(input)).toBe("a b\nc d");
    });

    it("does not collapse tabs", () => {
      const input = "a\t\tb  c";
      expect(t.action(input)).toBe("a\t\tb c");
    });

    it("handles empty string", () => {
      expect(t.action("")).toBe("");
    });

    it("leaves single spaces untouched", () => {
      expect(t.action("a b c")).toBe("a b c");
    });

    it("collapses multiple spaces in sequence", () => {
      expect(t.action("hello     world")).toBe("hello world");
    });

    it("is idempotent", () => {
      const input = "a   b    c";
      expect(t.action(t.action(input))).toBe(t.action(input));
    });
  });

  // REMOVE BLANK LINES TESTS
  describe("remove-blank-lines", () => {
    const t = get("remove-blank-lines");

    it("removes all empty lines", () => {
      const input = "hello\n\nworld\n\n\ntest";
      expect(t.action(input)).toBe("hello\nworld\ntest");
    });

    it("handles empty string", () => {
      expect(t.action("")).toBe("");
    });

    it("removes lines with only whitespace", () => {
      const input = "hello\n   \nworld\n\t\ntest";
      expect(t.action(input)).toBe("hello\nworld\ntest");
    });

    it("preserves lines with content", () => {
      const input = "a\nb\nc";
      expect(t.action(input)).toBe("a\nb\nc");
    });

    it("handles single line", () => {
      expect(t.action("hello")).toBe("hello");
    });

    it("handles consecutive blank lines", () => {
      const input = "line1\n\n\n\n\nline2";
      expect(t.action(input)).toBe("line1\nline2");
    });
  });

  // COLLAPSE BLANK LINES TESTS
  describe("collapse-blank-lines", () => {
    const t = get("collapse-blank-lines");

    it("reduces 3+ newlines to 2", () => {
      const input = "hello\n\n\n\nworld";
      expect(t.action(input)).toBe("hello\n\nworld");
    });

    it("leaves single and double newlines untouched", () => {
      const input = "a\nb\n\nc";
      expect(t.action(input)).toBe("a\nb\n\nc");
    });

    it("handles empty string", () => {
      expect(t.action("")).toBe("");
    });

    it("collapses many blank lines", () => {
      const input = "start\n\n\n\n\n\n\nend";
      expect(t.action(input)).toBe("start\n\nend");
    });

    it("is idempotent", () => {
      const input = "a\n\n\n\nb";
      expect(t.action(t.action(input))).toBe(t.action(input));
    });
  });

  // REMOVE TABS TESTS
  describe("remove-tabs (tabs to spaces)", () => {
    const t = get("remove-tabs");

    it("converts tabs to two spaces", () => {
      expect(t.action("hello\tworld")).toBe("hello  world");
    });

    it("handles multiple tabs", () => {
      expect(t.action("\t\t\thello")).toBe("      hello");
    });

    it("handles empty string", () => {
      expect(t.action("")).toBe("");
    });

    it("handles mixed tabs and spaces", () => {
      expect(t.action("a\t b  \tc")).toBe("a   b    c");
    });

    it("preserves non-tab whitespace", () => {
      expect(t.action("a   b")).toBe("a   b");
    });
  });

  // UPPERCASE TESTS
  describe("uppercase", () => {
    const t = get("uppercase");

    it("converts all text to uppercase", () => {
      expect(t.action("hello world")).toBe("HELLO WORLD");
    });

    it("handles already uppercase text", () => {
      expect(t.action("HELLO")).toBe("HELLO");
    });

    it("handles mixed case", () => {
      expect(t.action("HeLLo WoRLd")).toBe("HELLO WORLD");
    });

    it("handles empty string", () => {
      expect(t.action("")).toBe("");
    });

    it("handles numbers and symbols", () => {
      expect(t.action("hello123!@#")).toBe("HELLO123!@#");
    });

    it("handles unicode characters", () => {
      expect(t.action("café résumé")).toBe("CAFÉ RÉSUMÉ");
    });
  });

  // LOWERCASE TESTS
  describe("lowercase", () => {
    const t = get("lowercase");

    it("converts all text to lowercase", () => {
      expect(t.action("HELLO WORLD")).toBe("hello world");
    });

    it("handles already lowercase text", () => {
      expect(t.action("hello")).toBe("hello");
    });

    it("handles mixed case", () => {
      expect(t.action("HeLLo WoRLd")).toBe("hello world");
    });

    it("handles empty string", () => {
      expect(t.action("")).toBe("");
    });

    it("handles numbers and symbols", () => {
      expect(t.action("HELLO123!@#")).toBe("hello123!@#");
    });

    it("handles unicode characters", () => {
      expect(t.action("CAFÉ RÉSUMÉ")).toBe("café résumé");
    });
  });

  // CAPITALIZE WORDS TESTS
  describe("capitalize-words", () => {
    const t = get("capitalize-words");

    it("capitalizes first letter of each word", () => {
      expect(t.action("hello world")).toBe("Hello World");
    });

    it("handles already capitalized text", () => {
      expect(t.action("Hello World")).toBe("Hello World");
    });

    it("handles single word", () => {
      expect(t.action("hello")).toBe("Hello");
    });

    it("handles empty string", () => {
      expect(t.action("")).toBe("");
    });

    it("handles numbers", () => {
      expect(t.action("123 hello 456 world")).toBe("123 Hello 456 World");
    });

    it("handles hyphenated words", () => {
      expect(t.action("well-known artist")).toBe("Well-Known Artist");
    });

    it("handles punctuation", () => {
      expect(t.action("hello, world!")).toBe("Hello, World!");
    });

    it("handles multiline text", () => {
      expect(t.action("hello world\nfoo bar")).toBe("Hello World\nFoo Bar");
    });
  });

  // SENTENCE CASE TESTS
  describe("sentence-case", () => {
    const t = get("sentence-case");

    it("capitalizes first letter and after sentence terminators", () => {
      expect(t.action("hello world. how are you? i am fine!")).toBe(
        "Hello world. How are you? I am fine!"
      );
    });

    it("handles single sentence", () => {
      expect(t.action("hello world")).toBe("Hello world");
    });

    it("handles empty string", () => {
      expect(t.action("")).toBe("");
    });

    it("handles multiple sentence terminators", () => {
      expect(t.action("first. second! third?")).toBe("First. Second! Third?");
    });

    it("handles text starting with lowercase", () => {
      expect(t.action("first sentence. second sentence.")).toBe("First sentence. Second sentence.");
    });
  });

  // TOGGLE CASE TESTS
  describe("toggle-case", () => {
    const t = get("toggle-case");

    it("inverts case of every character", () => {
      expect(t.action("Hello World")).toBe("hELLO wORLD");
    });

    it("handles all uppercase", () => {
      expect(t.action("HELLO")).toBe("hello");
    });

    it("handles all lowercase", () => {
      expect(t.action("hello")).toBe("HELLO");
    });

    it("is idempotent (applying twice returns original)", () => {
      const input = "HeLLo WoRLd";
      expect(t.action(t.action(input))).toBe(input);
    });

    it("handles empty string", () => {
      expect(t.action("")).toBe("");
    });

    it("leaves numbers unchanged", () => {
      expect(t.action("ABC123def")).toBe("abc123DEF");
    });

    it("leaves symbols unchanged", () => {
      expect(t.action("Hello!@# World")).toBe("hELLO!@# wORLD");
    });
  });

  // ADD LINE NUMBERS TESTS
  describe("add-line-numbers", () => {
    const t = get("add-line-numbers");

    it("prefixes each line with its number", () => {
      const input = "hello\nworld\ntest";
      expect(t.action(input)).toBe("1. hello\n2. world\n3. test");
    });

    it("handles single line", () => {
      expect(t.action("hello")).toBe("1. hello");
    });

    it("handles empty string", () => {
      expect(t.action("")).toBe("1. ");
    });

    it("handles blank lines", () => {
      const input = "a\n\nc";
      expect(t.action(input)).toBe("1. a\n2. \n3. c");
    });

    it("increments correctly for many lines", () => {
      const input = Array(15).fill("line").join("\n");
      const output = t.action(input);
      expect(output).toContain("15. line");
    });
  });

  // SORT LINES TESTS
  describe("sort-lines", () => {
    const t = get("sort-lines");

    it("sorts lines alphabetically", () => {
      const input = "zebra\napple\nbanana";
      expect(t.action(input)).toBe("apple\nbanana\nzebra");
    });

    it("is case-sensitive (uppercase comes before lowercase)", () => {
      const input = "apple\nApple\nAPPLE";
      const output = t.action(input);
      expect(output.split("\n")[0]).toBe("APPLE");
    });

    it("handles single line", () => {
      expect(t.action("hello")).toBe("hello");
    });

    it("handles empty string", () => {
      expect(t.action("")).toBe("");
    });

    it("handles blank lines", () => {
      const input = "zebra\n\napple";
      const output = t.action(input);
      // blank line sorts first (empty string < filled string)
      expect(output.split("\n")[0]).toBe("");
    });

    it("handles numbers", () => {
      const input = "3\n1\n2";
      expect(t.action(input)).toBe("1\n2\n3");
    });
  });

  // REVERSE LINES TESTS
  describe("reverse-lines", () => {
    const t = get("reverse-lines");

    it("reverses the order of lines", () => {
      const input = "first\nsecond\nthird";
      expect(t.action(input)).toBe("third\nsecond\nfirst");
    });

    it("is idempotent applied twice", () => {
      const input = "a\nb\nc";
      expect(t.action(t.action(input))).toBe(input);
    });

    it("handles single line", () => {
      expect(t.action("hello")).toBe("hello");
    });

    it("handles empty string", () => {
      expect(t.action("")).toBe("");
    });

    it("handles blank lines", () => {
      const input = "a\n\nc";
      expect(t.action(input)).toBe("c\n\na");
    });
  });

  // REMOVE DUPLICATES TESTS
  describe("remove-duplicates", () => {
    const t = get("remove-duplicates");

    it("removes duplicate lines, keeps first occurrence", () => {
      const input = "apple\nbanana\napple\ncherry";
      expect(t.action(input)).toBe("apple\nbanana\ncherry");
    });

    it("handles no duplicates", () => {
      const input = "a\nb\nc";
      expect(t.action(input)).toBe("a\nb\nc");
    });

    it("handles all duplicates", () => {
      const input = "same\nsame\nsame";
      expect(t.action(input)).toBe("same");
    });

    it("handles empty string", () => {
      expect(t.action("")).toBe("");
    });

    it("treats blank lines as duplicates", () => {
      const input = "a\n\nb\n\nc";
      expect(t.action(input)).toBe("a\n\nb\nc");
    });

    it("is case-sensitive", () => {
      const input = "Apple\napple\napple";
      expect(t.action(input)).toBe("Apple\napple");
    });
  });

  // WRAP LINES TESTS
  describe("wrap-lines (wrap in quotes)", () => {
    const t = get("wrap-lines");

    it("wraps non-empty lines in double quotes", () => {
      const input = "hello\nworld";
      expect(t.action(input)).toBe('"hello"\n"world"');
    });

    it("skips empty lines", () => {
      const input = "hello\n\nworld";
      expect(t.action(input)).toBe('"hello"\n\n"world"');
    });

    it("skips lines with only whitespace", () => {
      const input = "hello\n   \nworld";
      expect(t.action(input)).toBe('"hello"\n   \n"world"');
    });

    it("handles single line", () => {
      expect(t.action("hello")).toBe('"hello"');
    });

    it("handles empty string", () => {
      expect(t.action("")).toBe("");
    });

    it("preserves line with existing quotes", () => {
      const input = '"already quoted"';
      expect(t.action(input)).toBe('""already quoted""');
    });
  });

  // JOIN LINES TESTS
  describe("join-lines", () => {
    const t = get("join-lines");

    it("joins lines with spaces, removing empty lines", () => {
      const input = "hello\nworld\ntest";
      expect(t.action(input)).toBe("hello world test");
    });

    it("filters out blank lines", () => {
      const input = "a\n\nb\n\n\nc";
      expect(t.action(input)).toBe("a b c");
    });

    it("handles single line", () => {
      expect(t.action("hello")).toBe("hello");
    });

    it("handles empty string", () => {
      expect(t.action("")).toBe("");
    });

    it("joins lines with spaces, not trimmed", () => {
      const input = "  hello  \n  world  ";
      expect(t.action(input)).toBe("  hello     world  ");
    });

    it("handles all blank lines", () => {
      const input = "\n\n\n";
      expect(t.action(input)).toBe("");
    });
  });

  // REMOVE KEYWORD TESTS
  describe("remove-keyword", () => {
    const t = get("remove-keyword");

    it("removes all occurrences of keyword", () => {
      const input = "hello world hello test hello";
      expect(t.action(input, { keyword: "hello" })).toBe(" world  test ");
    });

    it("handles empty keyword", () => {
      const input = "hello world";
      expect(t.action(input, { keyword: "" })).toBe("hello world");
    });

    it("handles missing params", () => {
      const input = "hello world";
      expect(t.action(input, {})).toBe("hello world");
    });

    it("handles keyword not in text", () => {
      const input = "hello world";
      expect(t.action(input, { keyword: "xyz" })).toBe("hello world");
    });

    it("removes phrase", () => {
      const input = "the quick brown fox jumps";
      expect(t.action(input, { keyword: "brown " })).toBe("the quick fox jumps");
    });

    it("is case-sensitive", () => {
      const input = "Hello hello HELLO";
      expect(t.action(input, { keyword: "hello" })).toBe("Hello  HELLO");
    });

    it("handles empty string", () => {
      expect(t.action("", { keyword: "test" })).toBe("");
    });
  });

  // REPLACE TEXT TESTS
  describe("replace-text (find & replace)", () => {
    const t = get("replace-text");

    it("finds and replaces text", () => {
      const input = "hello world hello";
      expect(t.action(input, { keyword: "hello|goodbye" })).toBe("goodbye world goodbye");
    });

    it("replaces with empty string", () => {
      const input = "hello world";
      expect(t.action(input, { keyword: "hello|" })).toBe(" world");
    });

    it("requires pipe separator", () => {
      const input = "hello world";
      expect(t.action(input, { keyword: "hello-world" })).toBe("hello world");
    });

    it("handles missing find part", () => {
      const input = "hello";
      expect(t.action(input, { keyword: "|replacement" })).toBe("hello");
    });

    it("handles phrase replacement", () => {
      const input = "the quick brown fox";
      expect(t.action(input, { keyword: "quick brown|fast" })).toBe("the fast fox");
    });

    it("is case-sensitive", () => {
      const input = "Hello hello HELLO";
      expect(t.action(input, { keyword: "hello|HI" })).toBe("Hello HI HELLO");
    });

    it("handles empty string", () => {
      expect(t.action("", { keyword: "a|b" })).toBe("");
    });

    it("handles missing params", () => {
      const input = "hello";
      expect(t.action(input, {})).toBe("hello");
    });
  });

  // REMOVE NUMBERS TESTS
  describe("remove-numbers", () => {
    const t = get("remove-numbers");

    it("removes all numeric digits", () => {
      expect(t.action("hello123world456")).toBe("helloworld");
    });

    it("preserves non-digit characters", () => {
      expect(t.action("abc123def456ghi")).toBe("abcdefghi");
    });

    it("handles empty string", () => {
      expect(t.action("")).toBe("");
    });

    it("handles text with no numbers", () => {
      expect(t.action("hello world")).toBe("hello world");
    });

    it("handles only numbers", () => {
      expect(t.action("123456")).toBe("");
    });

    it("removes numbers from mixed content", () => {
      expect(t.action("Version 2.5 released on 2024-03-01")).toBe("Version . released on --");
    });
  });

  // REMOVE PUNCTUATION TESTS
  describe("remove-punctuation", () => {
    const t = get("remove-punctuation");

    it("removes all punctuation", () => {
      expect(t.action("hello, world!")).toBe("hello world");
    });

    it("preserves alphanumeric and spaces", () => {
      expect(t.action("hello123world 456")).toBe("hello123world 456");
    });

    it("handles empty string", () => {
      expect(t.action("")).toBe("");
    });

    it("removes common punctuation", () => {
      expect(t.action("a.b,c!d?e;f:g")).toBe("abcdefg");
    });

    it("removes brackets and quotes", () => {
      expect(t.action('hello "world" (test) [array]')).toBe("hello world test array");
    });

    it("removes dashes and slashes", () => {
      expect(t.action("well-known and/or new")).toBe("wellknown andor new");
    });
  });

  // REMOVE HTML TESTS
  describe("remove-html", () => {
    const t = get("remove-html");

    it("removes HTML tags", () => {
      expect(t.action("<p>Hello <strong>world</strong></p>")).toBe("Hello world");
    });

    it("removes self-closing tags", () => {
      expect(t.action("Before<br/>After")).toBe("BeforeAfter");
    });

    it("handles empty string", () => {
      expect(t.action("")).toBe("");
    });

    it("removes tags with attributes", () => {
      expect(t.action('<div class="test">content</div>')).toBe("content");
    });

    it("preserves text between tags", () => {
      expect(t.action("<p>a</p><p>b</p><p>c</p>")).toBe("abc");
    });

    it("handles nested tags", () => {
      expect(t.action("<div><p><span>text</span></p></div>")).toBe("text");
    });

    it("removes XML style tags", () => {
      expect(t.action("<item>value</item>")).toBe("value");
    });
  });

  // REMOVE URLS TESTS
  describe("remove-urls", () => {
    const t = get("remove-urls");

    it("removes http urls", () => {
      expect(t.action("Visit http://example.com today")).toBe("Visit  today");
    });

    it("removes https urls", () => {
      expect(t.action("Go to https://example.com now")).toBe("Go to  now");
    });

    it("removes www urls", () => {
      expect(t.action("Check out www.example.com here")).toBe("Check out  here");
    });

    it("removes multiple URLs", () => {
      expect(t.action("http://a.com and https://b.com and www.c.com")).toBe(" and  and ");
    });

    it("handles empty string", () => {
      expect(t.action("")).toBe("");
    });

    it("leaves text without URLs unchanged", () => {
      expect(t.action("just plain text")).toBe("just plain text");
    });

    it("handles URLs with paths", () => {
      expect(t.action("See https://example.com/path/to/page")).toBe("See ");
    });

    it("handles URLs with query strings", () => {
      expect(t.action("Visit https://example.com?param=value")).toBe("Visit ");
    });
  });

  // REMOVE EMAILS TESTS
  describe("remove-emails", () => {
    const t = get("remove-emails");

    it("removes email addresses", () => {
      expect(t.action("Contact me at test@example.com please")).toBe("Contact me at  please");
    });

    it("removes multiple emails", () => {
      expect(t.action("Email john@example.com or jane@example.com")).toBe("Email  or ");
    });

    it("handles empty string", () => {
      expect(t.action("")).toBe("");
    });

    it("leaves text without emails unchanged", () => {
      expect(t.action("hello world")).toBe("hello world");
    });

    it("removes emails with different domains", () => {
      expect(t.action("a@test.co and b@example.org")).toBe(" and ");
    });

    it("is case-insensitive to email address", () => {
      expect(t.action("Test@EXAMPLE.COM")).toBe("");
    });
  });

  // GENERAL TESTS
  describe("all transforms handle edge cases", () => {
    it("all actions return string for empty input", () => {
      for (const t of builtInTransforms) {
        const out = t.action("");
        expect(typeof out).toBe("string");
      }
    });

    it("all actions return string for basic input", () => {
      for (const t of builtInTransforms) {
        const out = t.action("test");
        expect(typeof out).toBe("string");
      }
    });

    it("all actions handle undefined params gracefully", () => {
      for (const t of builtInTransforms) {
        const out = t.action("test", undefined);
        expect(typeof out).toBe("string");
      }
    });

    it("all actions handle very long input", () => {
      const longText = "a".repeat(10000);
      for (const t of builtInTransforms) {
        const out = t.action(longText);
        expect(typeof out).toBe("string");
      }
    });

    it("parametrized transforms have correct schema", () => {
      const paramTransforms = builtInTransforms.filter((t) => t.hasParams);
      for (const t of paramTransforms) {
        expect(t.paramLabel || t.paramLabel === "").toBeTruthy();
        expect(t.paramPlaceholder || t.paramPlaceholder === "").toBeTruthy();
      }
    });
  });
});
