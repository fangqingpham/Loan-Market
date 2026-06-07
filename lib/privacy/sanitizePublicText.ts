const REDACTION = "[contact hidden]";
const DIGIT_WORDS = "zero|one|two|three|four|five|six|seven|eight|nine";

type Pattern = {
  regex: RegExp;
  replacement?: string;
  replace?: (...args: string[]) => string;
};

export type SanitizePublicTextResult = {
  text: string;
  redacted: boolean;
};

const patterns: Pattern[] = [
  {
    // Contact-channel phrases followed by handles or short instructions.
    // Numeric values must be checked before @handles so @647-447-0097 is
    // redacted as one phone number rather than a partial handle.
    regex:
      /\b(whats\s*app|whatsapp|telegram|wechat|instagram|insta|facebook|messenger|sms|text(?:\s+me)?|call(?:\s+me)?|email(?:\s+me)?|dm(?:\s+me)?|message(?:\s+me)?|contact(?:\s+me)?|ig|fb)(\s*(?:me|at|on|:|-)?\s+)(@?[+()0-9][+()0-9\s.-]{6,}|@?[a-z0-9._-]{3,})/gi,
    replace: (match, phrase, separator) => {
      void match;
      return `${phrase}${separator}${REDACTION}`;
    },
  },
  {
    // Markdown mailto/email links, so the label and href are removed together.
    regex:
      /\[[^\]]*[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}[^\]]*\]\(\s*(?:mailto:)?[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\s*\)/gi,
  },
  {
    // mailto links and normal email addresses.
    regex: /\b(?:mailto:)?[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi,
  },
  {
    // Protocol URLs, www links, and plain domains such as abc.com/path.
    regex:
      /\b(?:(?:https?:\/\/|www\.)[^\s<>()]+|[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.(?:com|ca|net|org|co|io|biz|info|me|app|online|broker|finance|loans?)(?:\/[^\s<>()]*)?)/gi,
  },
  {
    // Canadian/US phone numbers: +1 optional, brackets/spaces/dashes/dots allowed.
    regex:
      /(^|[^\w])((?:\+?1[\s.-]*)?(?:\(?[2-9]\d{2}\)?[\s.-]*)\d{3}[\s.-]*\d{4})(?=$|[^\w])/g,
    replace: (match, prefix) => {
      void match;
      return `${prefix}${REDACTION}`;
    },
  },
  {
    // Spelled-out phone numbers such as "six four seven four four seven zero zero nine seven".
    regex: new RegExp(`\\b(?:(?:${DIGIT_WORDS})[\\s-]+){6,}(?:${DIGIT_WORDS})\\b`, "gi"),
  },
  {
    // Standalone social handles. Kept conservative to avoid normal @mentions.
    regex: /\b(ig|fb|instagram|facebook|telegram|wechat)(\s+)@[a-z0-9._-]{3,}/gi,
    replace: (match, phrase, separator) => {
      void match;
      return `${phrase}${separator}${REDACTION}`;
    },
  },
];

function collapseRedactions(value: string): string {
  return value
    .replace(new RegExp(`(?:${escapeRegExp(REDACTION)}\\s*){2,}`, "g"), REDACTION)
    .replace(/\s+([,.!?;:])/g, "$1")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function sanitizePublicTextWithResult(
  input: string | null | undefined
): SanitizePublicTextResult {
  if (!input) return { text: "", redacted: false };

  let text = input;
  let redacted = false;

  for (const pattern of patterns) {
    text = text.replace(pattern.regex, (...args: string[]) => {
      redacted = true;
      if (pattern.replace) return pattern.replace(...args);
      const match = args[0];
      if (pattern.replacement) {
        return match.startsWith(" ") ? ` ${pattern.replacement}` : pattern.replacement;
      }
      return REDACTION;
    });
  }

  return { text: collapseRedactions(text), redacted };
}

export function sanitizePublicText(input: string | null | undefined): string {
  return sanitizePublicTextWithResult(input).text;
}
