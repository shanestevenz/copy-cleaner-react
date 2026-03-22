export interface TextTransform {
  id: string;
  name: string;
  description: string;
  category: "cleanup" | "case" | "format" | "remove" | "custom";
  icon: string;
  action: (text: string, params?: Record<string, string>) => string;
  hasParams?: boolean;
  paramLabel?: string;
  paramPlaceholder?: string;
}

export const builtInTransforms: TextTransform[] = [
  // Cleanup
  {
    id: "trim-whitespace",
    name: "Trim Whitespace",
    description: "Remove leading and trailing whitespace from each line",
    category: "cleanup",
    icon: "scissors",
    action: (text) =>
      text
        .split("\n")
        .map((line) => line.trim())
        .join("\n"),
  },
  {
    id: "collapse-spaces",
    name: "Collapse Spaces",
    description: "Replace multiple spaces with a single space",
    category: "cleanup",
    icon: "minimize-2",
    action: (text) => text.replace(/ {2,}/g, " "),
  },
  {
    id: "remove-blank-lines",
    name: "Remove Blank Lines",
    description: "Remove all empty lines from the text",
    category: "cleanup",
    icon: "minus",
    action: (text) =>
      text
        .split("\n")
        .filter((line) => line.trim() !== "")
        .join("\n"),
  },
  {
    id: "collapse-blank-lines",
    name: "Collapse Blank Lines",
    description: "Reduce multiple blank lines to a single blank line",
    category: "cleanup",
    icon: "fold-vertical",
    action: (text) => text.replace(/\n{3,}/g, "\n\n"),
  },
  {
    id: "remove-tabs",
    name: "Tabs to Spaces",
    description: "Convert all tab characters to spaces",
    category: "cleanup",
    icon: "indent-decrease",
    action: (text) => text.replace(/\t/g, "  "),
  },

  // Case
  {
    id: "uppercase",
    name: "UPPERCASE",
    description: "Convert all text to uppercase",
    category: "case",
    icon: "arrow-up",
    action: (text) => text.toUpperCase(),
  },
  {
    id: "lowercase",
    name: "lowercase",
    description: "Convert all text to lowercase",
    category: "case",
    icon: "arrow-down",
    action: (text) => text.toLowerCase(),
  },
  {
    id: "capitalize-words",
    name: "Capitalize Words",
    description: "Capitalize the first letter of every word",
    category: "case",
    icon: "type",
    action: (text) => text.replace(/\b\w/g, (char) => char.toUpperCase()),
  },
  {
    id: "sentence-case",
    name: "Sentence Case",
    description: "Capitalize the first letter of each sentence",
    category: "case",
    icon: "text",
    action: (text) => text.replace(/(^\s*\w|[.!?]\s+\w)/g, (char) => char.toUpperCase()),
  },
  {
    id: "toggle-case",
    name: "tOGGLE cASE",
    description: "Invert the case of every character",
    category: "case",
    icon: "refresh-cw",
    action: (text) =>
      text
        .split("")
        .map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()))
        .join(""),
  },

  // Format
  {
    id: "add-line-numbers",
    name: "Add Line Numbers",
    description: "Prefix each line with its line number",
    category: "format",
    icon: "hash",
    action: (text) =>
      text
        .split("\n")
        .map((line, i) => `${i + 1}. ${line}`)
        .join("\n"),
  },
  {
    id: "sort-lines",
    name: "Sort Lines A-Z",
    description: "Sort all lines alphabetically",
    category: "format",
    icon: "arrow-down-a-z",
    action: (text) => text.split("\n").sort().join("\n"),
  },
  {
    id: "reverse-lines",
    name: "Reverse Lines",
    description: "Reverse the order of all lines",
    category: "format",
    icon: "arrow-down-up",
    action: (text) => text.split("\n").reverse().join("\n"),
  },
  {
    id: "remove-duplicates",
    name: "Remove Duplicates",
    description: "Remove duplicate lines, keep first occurrence",
    category: "format",
    icon: "copy-minus",
    action: (text) => [...new Set(text.split("\n"))].join("\n"),
  },
  {
    id: "wrap-lines",
    name: "Wrap in Quotes",
    description: "Wrap each non-empty line in double quotes",
    category: "format",
    icon: "quote",
    action: (text) =>
      text
        .split("\n")
        .map((line) => (line.trim() ? `"${line}"` : line))
        .join("\n"),
  },
  {
    id: "join-lines",
    name: "Join Lines",
    description: "Join all lines into a single line with spaces",
    category: "format",
    icon: "merge",
    action: (text) =>
      text
        .split("\n")
        .filter((l) => l.trim())
        .join(" "),
  },

  // Remove
  {
    id: "remove-keyword",
    name: "Remove Keyword",
    description: "Remove all occurrences of a specific word or phrase",
    category: "remove",
    icon: "x",
    hasParams: true,
    paramLabel: "Keyword to remove",
    paramPlaceholder: "Enter word or phrase...",
    action: (text, params) => {
      const keyword = params?.keyword || "";
      if (!keyword) return text;
      return text.split(keyword).join("");
    },
  },
  {
    id: "replace-text",
    name: "Find & Replace",
    description: "Find text and replace with something else",
    category: "remove",
    icon: "replace",
    hasParams: true,
    paramLabel: "Find | Replace with",
    paramPlaceholder: "find|replace",
    action: (text, params) => {
      const keyword = params?.keyword || "";
      if (!keyword.includes("|")) return text;
      const [find, replace] = keyword.split("|");
      if (!find) return text;
      return text.split(find).join(replace || "");
    },
  },
  {
    id: "remove-numbers",
    name: "Remove Numbers",
    description: "Strip all numeric digits from the text",
    category: "remove",
    icon: "hash",
    action: (text) => text.replace(/\d/g, ""),
  },
  {
    id: "remove-punctuation",
    name: "Remove Punctuation",
    description: "Remove all punctuation characters",
    category: "remove",
    icon: "eraser",
    action: (text) => text.replace(/[^\w\s]/g, ""),
  },
  {
    id: "remove-html",
    name: "Strip HTML Tags",
    description: "Remove all HTML/XML tags from the text",
    category: "remove",
    icon: "code",
    action: (text) => text.replace(/<[^>]*>/g, ""),
  },
  {
    id: "remove-urls",
    name: "Remove URLs",
    description: "Remove all URLs (http, https, www) from text",
    category: "remove",
    icon: "link",
    action: (text) => text.replace(/https?:\/\/\S+|www\.\S+/g, ""),
  },
  {
    id: "remove-emails",
    name: "Remove Emails",
    description: "Remove all email addresses from text",
    category: "remove",
    icon: "mail",
    action: (text) => text.replace(/\S+@\S+\.\S+/g, ""),
  },
];

export interface CustomRule {
  id: string;
  name: string;
  type: "remove" | "replace" | "prefix" | "suffix" | "regex";
  find: string;
  replace: string;
}

export function applyCustomRule(text: string, rule: CustomRule): string {
  switch (rule.type) {
    case "remove":
      return text.split(rule.find).join("");
    case "replace":
      return text.split(rule.find).join(rule.replace);
    case "prefix":
      return text
        .split("\n")
        .map((line) => (line.trim() ? `${rule.find}${line}` : line))
        .join("\n");
    case "suffix":
      return text
        .split("\n")
        .map((line) => (line.trim() ? `${line}${rule.find}` : line))
        .join("\n");
    case "regex":
      try {
        const regex = new RegExp(rule.find, "g");
        return text.replace(regex, rule.replace);
      } catch {
        return text;
      }
    default:
      return text;
  }
}
