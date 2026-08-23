import MathField from "./MathField";
import { parseMathContent, serializeMathContent } from "../../utils/mathContent";

const normaliseBlocks = (blocks) => {
  const result = [];

  for (const block of blocks) {
    const previous = result.at(-1);
    if (block.type === "text" && previous?.type === "text") {
      previous.value += block.value;
    } else {
      result.push(block);
    }
  }

  return result.length ? result : [{ type: "text", value: "" }];
};

export default function MathContentEditor({ value = "", onChange, label }) {
  const blocks = parseMathContent(value);

  const commit = (nextBlocks) => onChange(serializeMathContent(normaliseBlocks(nextBlocks)));

  const updateBlock = (index, nextValue) => {
    commit(blocks.map((block, blockIndex) =>
      blockIndex === index ? { ...block, value: nextValue } : block
    ));
  };

  const addEquation = () => {
    const next = [...blocks];
    if (next.at(-1)?.type === "text" && next.at(-1).value === "") {
      next.splice(next.length - 1, 0, { type: "math", value: "", display: false });
    } else {
      next.push({ type: "math", value: "", display: false }, { type: "text", value: "" });
    }
    commit(next);
  };

  const removeEquation = (index) => {
    commit(blocks.filter((_, blockIndex) => blockIndex !== index));
  };

  return (
    <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-3">
      {blocks.map((block, index) =>
        block.type === "text" ? (
          <textarea
            key={index}
            aria-label={`${label} text ${index + 1}`}
            value={block.value}
            onChange={(event) => updateBlock(index, event.target.value)}
            placeholder={index === 0 ? "Enter ordinary question wording" : "Continue the wording"
            }
            rows={Math.max(2, block.value.split("\n").length)}
            className="w-full resize-y rounded-lg border bg-white px-3 py-2"
          />
        ) : (
          <div key={index} className="rounded-lg border border-indigo-100 bg-indigo-50 p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                Equation
              </span>
              <button
                type="button"
                onClick={() => removeEquation(index)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Remove equation
              </button>
            </div>
            <MathField
              value={block.value}
              onChange={(nextValue) => updateBlock(index, nextValue)}
              label={`${label} equation ${index + 1}`}
            />
            <p className="mt-2 text-xs text-gray-500">
              Type normally or use the maths keyboard. The formatting is saved automatically.
            </p>
          </div>
        )
      )}

      <button
        type="button"
        onClick={addEquation}
        className="rounded-lg border border-indigo-300 bg-white px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
      >
        + Insert equation
      </button>
    </div>
  );
}

