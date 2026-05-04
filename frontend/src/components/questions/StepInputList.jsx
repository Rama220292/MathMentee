export default function StepInputList({
  fields,
  append,
  remove,
  register,
  errors
}) {
  return (
    <div className="space-y-3">

      <h3 className="font-semibold text-gray-700">
        Model Answer Steps
      </h3>

      {/* Header */}
      <div className="flex gap-2 text-sm text-gray-500 px-1">
        <div className="flex-1">Step</div>
        <div className="w-20 text-center">Marks</div>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-2 items-center">

          {/* Step content */}
          <input
            {...register(`steps.${index}.content`)}
            placeholder={`Step ${index + 1}`}
            className="flex-1 border rounded-lg px-3 py-2"
          />

          {/* Marks */}
          <input
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