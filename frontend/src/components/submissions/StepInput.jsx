export default function StepInput({
  fields,
  append,
  remove,
  register,
  errors
}) {
  return (
    <div className="space-y-3">

      <h3 className="font-semibold text-gray-700">
        Your Working Steps
      </h3>

      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-2">

          <input
            {...register(`steps.${index}.content`)}
            placeholder={`Step ${index + 1}`}
            className="flex-1 border rounded-lg px-3 py-2"
          />

          <button
            type="button"
            onClick={() => remove(index)}
            className="text-red-500"
          >
            ✕
          </button>

        </div>
      ))}

      {errors.steps && (
        <p className="text-red-500 text-sm">
          {errors.steps.message}
        </p>
      )}

      <button
        type="button"
        onClick={() => append({ content: "" })}
        className="text-indigo-600 font-medium"
      >
        + Add Step
      </button>

    </div>
  );
}