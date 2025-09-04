"use client";
import { useForm } from "react-hook-form";
import axios from "@/utils/axiosInstance";
import { useState } from "react";

export default function AddSchool() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue, // ✅ added this
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // ✅ Save the actual File into react-hook-form state
      setValue("image", file);
    } else {
      setImagePreview(null);
      setValue("image", null as any);
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("city", data.city);
      formData.append("address", data.address);
      formData.append("state", data.state);
      formData.append("contact", data.contact);
      formData.append("email_id", data.email_id);

      if (data.image instanceof File) {
        formData.append("image", data.image);
      }

      await axios.post("/schools", formData, {
        headers: { "Content-Type": "multipart/form-data" }, // ✅ enforce multipart
      });

      setMessage("School added successfully!");
      setImagePreview(null);
      reset();
    } catch (err: any) {
      setMessage(err?.response?.data?.error || "Error adding school");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <h2 className="text-3xl font-bold">Add New School</h2>
          <p className="mt-2 opacity-90">
            Fill in the details below to register a new school
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                School Name *
              </label>
              <input
                {...register("name", { required: true })}
                placeholder="Enter school name"
                className={`input dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.name && (
                <span className="text-red-500 text-sm">Name is required</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                City *
              </label>
              <input
                {...register("city", { required: true })}
                placeholder="Enter city"
                className={`input dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 ${
                  errors.city ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.city && (
                <span className="text-red-500 text-sm">City is required</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Address *
            </label>
            <input
              {...register("address", { required: true })}
              placeholder="Enter full address"
              className={`input dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 ${
                errors.address ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.address && (
              <span className="text-red-500 text-sm">Address is required</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                State *
              </label>
              <input
                {...register("state", { required: true })}
                placeholder="Enter state"
                className={`input dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 ${
                  errors.state ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.state && (
                <span className="text-red-500 text-sm">State is required</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Contact Number *
              </label>
              <input
                {...register("contact", {
                  required: true,
                  pattern: /^[0-9]{10,}$/,
                })}
                placeholder="10-digit contact number"
                className={`input dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 ${
                  errors.contact ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.contact && (
                <span className="text-red-500 text-sm">
                  Valid contact number is required
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address *
            </label>
            <input
              {...register("email_id", {
                required: true,
                pattern: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
              })}
              placeholder="Enter email address"
              className={`input dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 ${
                errors.email_id ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email_id && (
              <span className="text-red-500 text-sm">
                Valid email is required
              </span>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              School Image
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400 text-center px-2">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </div>
            ) : (
              "Add School"
            )}
          </button>

          {message && (
            <div
              className={`p-3 rounded-lg text-center ${
                message.includes("successfully")
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

// Enhanced input style with dark mode support
const inputStyle = `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors`;
