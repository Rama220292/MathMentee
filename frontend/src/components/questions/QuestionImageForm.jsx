import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { validateQuestionImage } from "../../services/questionService";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const imageSchema = z
  .instanceof(File, { message: "Choose or take a question photo" })
  .refine((file) => SUPPORTED_IMAGE_TYPES.includes(file.type), {
    message: "Use a JPEG, PNG, or WebP image"
  })
  .refine((file) => file.size <= MAX_IMAGE_SIZE, {
    message: "Image must be 10 MB or smaller"
  });

const schema = z.object({ image: imageSchema });

export default function QuestionImageForm({ onBack, onValidated }) {
  const [previewUrl, setPreviewUrl] = useState("");
  const {
    handleSubmit,
    register,
    setValue,
    control,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(schema) });

  const image = useWatch({ control, name: "image" });

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl]
  );

  const fileInput = register("image");

  const submitImage = async ({ image: selectedImage }) => {
    try {
      const validation = await validateQuestionImage({
        filename: selectedImage.name,
        contentType: selectedImage.type,
        size: selectedImage.size
      });

      toast.success("Photo is ready to upload");
      onValidated?.({ file: selectedImage, validation });
    } catch (error) {
      toast.error(error.response?.data?.err || "Photo validation failed");
    }
  };

  return (
    <section className="relative z-10 bg-white p-6 md:p-10 rounded-2xl shadow-lg w-full max-w-2xl">
      <div className="text-center mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Step 1 of 4
        </p>
        <h1 className="text-3xl font-semibold text-gray-800 mt-1">
          Add a question photo
        </h1>
        <p className="text-gray-600 mt-2">
          Take a clear photo or select one from your device.
        </p>
      </div>

      <form onSubmit={handleSubmit(submitImage)} className="space-y-5">
        <label className="block border-2 border-dashed border-indigo-200 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-400 transition">
          <span className="block font-medium text-gray-800">
            Take or select a photo
          </span>
          <span className="block text-sm text-gray-500 mt-1">
            JPEG, PNG, or WebP · maximum 10 MB
          </span>
          <input
            {...fileInput}
            type="file"
            accept={SUPPORTED_IMAGE_TYPES.join(",")}
            capture="environment"
            className="sr-only"
            onChange={(event) => {
              const selectedFile = event.target.files?.[0];
              fileInput.onChange(event);
              setValue("image", selectedFile, {
                shouldDirty: true,
                shouldValidate: true
              });
              setPreviewUrl(
                selectedFile?.type.startsWith("image/")
                  ? URL.createObjectURL(selectedFile)
                  : ""
              );
            }}
          />
        </label>

        {errors.image && (
          <p role="alert" className="text-sm text-red-600">
            {errors.image.message}
          </p>
        )}

        {previewUrl && (
          <figure className="rounded-xl overflow-hidden border bg-gray-50">
            <img
              src={previewUrl}
              alt="Selected question preview"
              className="w-full max-h-96 object-contain"
            />
            <figcaption className="px-4 py-3 text-sm text-gray-600 border-t">
              {image.name} · {(image.size / (1024 * 1024)).toFixed(2)} MB
            </figcaption>
          </figure>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-full py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !(image instanceof File)}
            className="w-full py-3 rounded-lg text-white font-medium bg-gradient-to-r from-purple-500 to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Checking photo..." : "Continue"}
          </button>
        </div>
      </form>
    </section>
  );
}
