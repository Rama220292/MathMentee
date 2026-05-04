export default function FinalAnswerInput({ register, errors }) {
  return (
    <div>

      <label className="block font-medium mb-1">
        Final Answer
      </label>

      <input
        {...register("final_answer")}
        placeholder="Enter your final answer"
        className="w-full border rounded-lg px-3 py-2"
      />

      <p className="text-red-500 text-sm mt-1">
        {errors.final_answer?.message}
      </p>

    </div>
  );
}