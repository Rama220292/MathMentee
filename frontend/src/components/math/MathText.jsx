import MathField from "./MathField";
import { parseMathContent } from "../../utils/mathContent";

export default function MathText({ children = "", className = "" }) {
  const blocks = parseMathContent(String(children));

  return (
    <span className={`whitespace-pre-wrap ${className}`}>
      {blocks.map((block, index) =>
        block.type === "math" ? (
          <span
            key={index}
            className={block.display ? "my-3 block text-center" : "inline-block align-middle"}
          >
            <MathField value={block.value} readOnly />
          </span>
        ) : (
          <span key={index}>{block.value}</span>
        )
      )}
    </span>
  );
}

