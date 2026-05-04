import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import StepInputList from "./StepInputList";
import { createQuestion, updateQuestion, getQuestionMeta } from "../../services/questionService";

// ================= ZOD =================
const stepSchema = z.object({
  content: z.string().min(1, "Step is required"),
  marks: z
    .number({ invalid_type_error: "Marks must be a number" })
    .min(1, "Marks must be at least 1")
});

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  question_text: z.string().min(1, "Question is required"),
  topic: z.string().min(1, "Topic is required"),
  level: z.string().min(1, "Level is required"),
  final_answer: z.string().min(1, "Final answer is required"),
  final_answer_marks: z
    .number({ invalid_type_error: "Must be a number" })
    .min(1, "Must be at least 1"),
  steps: z.array(stepSchema).min(1, "At least one step is required")
});

export default function QuestionsForm({ initialData = null, onSuccess, onCancel }) {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(false);

  // ================= FORM =================
    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors }
        } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            title: initialData?.title || "",
            question_text: initialData?.question_text || "",
            topic: initialData?.topic || "",
            level: initialData?.level || "",
            final_answer: initialData?.model_answer?.final_answer || "",
            final_answer_marks: initialData?.final_answer_marks || 0,
            steps: initialData?.model_answer?.steps || []
        }
    });

  // ================= FIELD ARRAY =================
  const { fields, append, remove } = useFieldArray({
    control,
    name: "steps"
  });

  // ================= WATCH =================
  const watchedSteps = useWatch({ control, name: "steps" });
  const watchedFinalMarks = useWatch({
    control,
    name: "final_answer_marks"
  });

  // ================= TOTAL MARKS =================
  const totalMarks =
    (watchedSteps || []).reduce(
      (sum, step) => sum + (Number(step?.marks) || 0),
      0
    ) + (Number(watchedFinalMarks) || 0);

  // ================= FETCH META =================
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const data = await getQuestionMeta();
        setTopics(data.topics);
        setLevels(data.levels);
      } catch {
        toast.error("Failed to load options");
      }
    };

    fetchMeta();
  }, []);

  // ================= SUBMIT =================
const onSubmit = async (data) => {
  setLoading(true);

  try {
    const payload = {
      title: data.title,
      question_text: data.question_text,
      topic: data.topic,
      level: data.level,

      model_answer: {
        final_answer: data.final_answer,
        steps: data.steps
      },

      final_answer_marks: Number(data.final_answer_marks)
    };

    if (initialData) {
      // EDIT MODE
      await updateQuestion(initialData._id, payload);
      toast.success("Question updated!");
    } else {
      // CREATE MODE
      await createQuestion(payload);
      toast.success("Question created!");
      reset();
    }

    onSuccess?.();

  } catch (err) {
    toast.error(err.response?.data?.err || "Failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center relative">

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/Background_2.png')" }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

      {/* Card */}
      <div className="relative z-10 bg-white p-10 rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img
            src="/images/MMLogo.png"
            alt="MathMentor Logo"
            className="w-32 md:w-40 lg:w-62 object-contain"
          />
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-semibold text-gray-800">
            Create Question
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Title */}
          <div>
            <input
              {...register("title")}
              placeholder="Title"
              className="w-full border px-3 py-2 rounded-lg"
            />
            <p className="text-red-500 text-sm">{errors.title?.message}</p>
          </div>

          {/* Question */}
          <div>
            <textarea
              {...register("question_text")}
              placeholder="Question"
              className="w-full border px-3 py-2 rounded-lg"
            />
            <p className="text-red-500 text-sm">
              {errors.question_text?.message}
            </p>
          </div>

          {/* Topic + Level */}
          <div className="flex gap-2">

            <div className="flex-1">
              <label className="text-sm font-medium">Topic</label>
              <select {...register("topic")} className="border p-2 rounded-lg w-full">
                <option value="">Select topic</option>
                {topics.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <p className="text-red-500 text-sm">{errors.topic?.message}</p>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium">Level</label>
              <select {...register("level")} className="border p-2 rounded-lg w-full">
                <option value="">Select level</option>
                {levels.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <p className="text-red-500 text-sm">{errors.level?.message}</p>
            </div>

          </div>

          {/* Final Answer */}
          <div>
            <input
              {...register("final_answer")}
              placeholder="Final Answer"
              className="w-full border px-3 py-2 rounded-lg"
            />
            <p className="text-red-500 text-sm">
              {errors.final_answer?.message}
            </p>
          </div>

          {/* Final Marks */}
          <div>
            <input
              type="number"
              inputMode="numeric"
              {...register("final_answer_marks", { valueAsNumber: true })}
              placeholder="Final Answer Marks"
              className="w-full border px-3 py-2 rounded-lg"
            />
            <p className="text-red-500 text-sm">
              {errors.final_answer_marks?.message}
            </p>
          </div>

          {/* Steps */}
          <StepInputList
            fields={fields}
            append={append}
            remove={remove}
            register={register}
            errors={errors}
          />

          {/* Total Marks */}
          <div className="flex justify-between items-center px-4 py-3 rounded-lg border bg-gradient-to-r from-purple-50 to-indigo-50">
            <span className="text-gray-700 font-medium">
              Total Marks
            </span>

            <span className="text-xl font-bold text-indigo-600">
              {totalMarks}
            </span>
          </div>

          {totalMarks === 0 && (
            <p className="text-sm text-red-500">
              Total marks must be greater than 0
            </p>
          )}

          {/* Submit */}
        <div className="flex gap-2">

            <button
                type="button"
                onClick={() => {
                    if (onCancel) onCancel();      
                    else navigate("/questions");    
                }}
                className="w-full py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
                Cancel
            </button>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-lg text-white font-medium 
                bg-gradient-to-r from-purple-500 to-indigo-500 flex justify-center items-center"
            >
                {loading
                ? initialData
                    ? "Updating..."
                    : "Creating..."
                : initialData
                    ? "Edit Question"
                    : "Create Question"}
            </button>

        </div>

        </form>
      </div>
    </div>
  );
}