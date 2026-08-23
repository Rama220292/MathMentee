import { useEffect, useRef } from "react";
import "mathlive";

export default function MathField({ value = "", onChange, label, readOnly = false }) {
  const fieldRef = useRef(null);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;

    field.readOnly = readOnly;
    field.mathVirtualKeyboardPolicy = readOnly ? "manual" : "auto";
    field.setAttribute("aria-label", label || (readOnly ? "Mathematical expression" : "Edit equation"));
  }, [label, readOnly]);

  useEffect(() => {
    const field = fieldRef.current;
    if (field && field.value !== value) field.value = value;
  }, [value]);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field || readOnly || !onChange) return;

    const handleInput = () => onChange(field.value);
    field.addEventListener("input", handleInput);
    return () => field.removeEventListener("input", handleInput);
  }, [onChange, readOnly]);

  return (
    <math-field
      ref={fieldRef}
      className={readOnly
        ? "inline-block min-w-0 border-0 bg-transparent p-0"
        : "block w-full min-h-12 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-lg focus-within:border-indigo-500"}
    />
  );
}
