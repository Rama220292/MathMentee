import { Controller } from "react-hook-form";
import MathContentEditor from "../math/MathContentEditor";

export default function StepInputList({
  fields,
  append,
  remove,
  register,
  control,
  errors
}) {
  return (
    <div className="space-y-3">

      <h3 className="font-semibold text-gray-700">
        Worked solution and step marks
      </h3>
      <p className="text-sm text-gray-500">
        Review each proposed working step and assign the marks awarded for it.
      </p>

      {/* Header */}
      <div className="flex gap-2 text-sm text-gray-500 px-1">
        <div className="flex-1">Working or explanation</div>
        <div className="w-20 text-center">Step marks</div>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-2 items-center">

          {/* Step content */}
          <div className="flex-1">
            <Controller
              name={`steps.${index}.content`}
              control={control}
              render={({ field: controlledField }) => (
                <MathContentEditor
                  value={controlledField.value}
                  onChange={controlledField.onChange}
                  label={`Working for step ${index + 1}`}
                />
              )}
            />
          </div>

          {/* Marks */}
          <input
            aria-label={`Marks for step ${index + 1}`}
            type="number"
            {...register(`steps.${index}.marks`, { valueAsNumber: true })}
            className="w-20 border rounded-lg px-2 py-2"
          />

          {/* Remove */}
          <button
            type="button"
            onClick={() => remove(index)}
            className="text-red-500"
          >
            ✕
          </button>

        </div>
      ))}

      {/* Errors */}
      {errors.steps && (
        <p className="text-red-500 text-sm">
          {errors.steps.message}
        </p>
      )}

      {/* Add step */}
      <button
        type="button"
        onClick={() => append({ content: "", marks: "" })}
        className="text-indigo-600 font-medium"
      >
        + Add Step
      </button>
    </div>
  );
}
