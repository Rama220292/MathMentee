import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useState } from "react"

import StepInput from "./StepInput";
import FinalAnswerInput from "./FinalAnswerInput";
import { createSubmission } from "../../services/submissionService";
import ConfirmButton from "../common/ConfirmButton";

const stepSchema = z.object({
  content: z.string().min(1, "Step is required")
});

const schema = z.object({
  steps: z.array(stepSchema).min(1, "At least one step required"),
  final_answer: z.string().min(1, "Final answer is required")
});

export default function SubmissionForm({ questionId }) {
    const navigate = useNavigate()
    const [confirmOpen, setConfirmOpen] = useState(false);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      steps: [{ content: "" }],
      final_answer: ""
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "steps"
  });

  const onSubmit = async (data) => {
    try {
      const res = await createSubmission({
        questionId,
        raw_input: data.steps.map(s => s.content).join("\n"),
        structured_answer: {
            steps: data.steps.map(s => s.content),
            final_answer: data.final_answer
        }
      });

      toast.success("Submitted!");
      navigate(`/submissions/${res._id}`)
    } catch {
      toast.error("Submission failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* Steps */}
      <StepInput
        fields={fields}
        append={append}
        remove={remove}
        register={register}
        errors={errors}
      />

      {/* Final Answer */}
      <FinalAnswerInput register={register} errors={errors} />

      {/* Submit */}
        <div className="flex gap-2">

            {/* Cancel */}
            <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="w-full py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
                Cancel
            </button>

            {/* Submit */}
            <button
                type="submit"
                className="w-full py-2 rounded-lg text-white font-medium 
                bg-gradient-to-r from-purple-500 to-indigo-500"
            >
                Submit Answer
            </button>

            {confirmOpen && (
            <ConfirmButton
                message="Discard your answer and go back?"
                confirmText="Confirm"
                confirmType="primary"
                onConfirm={() => {
                setConfirmOpen(false);
                navigate("/questions");
                }}
                onCancel={() => setConfirmOpen(false)}
            />
            )}  

        </div>

    </form>

    
  );
}