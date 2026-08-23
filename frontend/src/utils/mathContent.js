const MATH_DELIMITER_PATTERN = /(\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\])/g;

export const parseMathContent = (content = "") => {
  const blocks = [];
  let cursor = 0;

  for (const match of content.matchAll(MATH_DELIMITER_PATTERN)) {
    if (match.index > cursor) {
      blocks.push({ type: "text", value: content.slice(cursor, match.index) });
    }

    const raw = match[0];
    const display = raw.startsWith("\\[");
    blocks.push({
      type: "math",
      value: raw.slice(2, -2).trim(),
      display
    });
    cursor = match.index + raw.length;
  }

  if (cursor < content.length || blocks.length === 0) {
    blocks.push({ type: "text", value: content.slice(cursor) });
  }

  return blocks;
};

export const serializeMathContent = (blocks) =>
  blocks
    .map((block) => {
      if (block.type === "text") return block.value;
      return block.display
        ? `\\[${block.value}\\]`
        : `\\(${block.value}\\)`;
    })
    .join("");

