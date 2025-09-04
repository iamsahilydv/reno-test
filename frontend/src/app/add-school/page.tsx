"use client";
import { useForm } from "react-hook-form";
import axios from "@/utils/axiosInstance";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddSchool() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
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
      formData.append("name", data.name || "");
      formData.append("city", data.city || "");
      formData.append("address", data.address || "");
      formData.append("state", data.state || "");
      formData.append("contact", data.contact || "");
      formData.append("email_id", data.email_id || "");

      if (data.image && data.image instanceof File) {
        formData.append("image", data.image);
        console.log("Image file:", data.image.name, data.image.size, "bytes");
      } else {
        console.log("No image file to upload");
      }

      console.log("Sending FormData with fields:");
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.size} bytes)`);
        } else {
          console.log(`${key}: "${value}"`);
        }
      }

      const response = await axios.post("/api/schools", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      });

      console.log("Success response:", response.data);
      setMessage("School added successfully!");
      setImagePreview(null);
      reset();
    } catch (err: any) {
      console.error("Upload error:", err);

      let errorMessage = "Error adding school";

      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;

        if (err.response.data.details) {
          console.error("Error details:", err.response.data.details);
        }
        if (err.response.data.receivedFields) {
          console.error(
            "Fields received by server:",
            err.response.data.receivedFields
          );
        }
      } else if (err.code === "ECONNABORTED") {
        errorMessage = "Request timeout - please try again";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-gray-900 dark:to-indigo-950 py-12 px-4">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              School Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Manage and organize educational institutions
            </p>
          </div>
          <button
            onClick={() => router.push("/show-schools")}
            className="group flex items-center gap-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <svg
              className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <span className="font-medium">Show Schools</span>
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
          {/* Form Header */}
          <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-8">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 text-white">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <svg
                    className="w-8 h-8"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Add New School</h2>
                  <p className="mt-1 opacity-90 text-blue-100">
                    Register a new educational institution
                  </p>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-4 right-4 opacity-20">
                <svg
                  className="w-24 h-24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
            {/* School Name & City Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  School Name *
                </label>
                <input
                  {...register("name", { required: "School name is required" })}
                  placeholder="Enter school name"
                  className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 group-hover:border-blue-300 ${
                    errors.name
                      ? "border-red-400 focus:border-red-500"
                      : "border-gray-200 dark:border-gray-600 focus:border-blue-500"
                  }`}
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {/* {errors.name.message} */}
                  </p>
                )}
              </div>

              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  City *
                </label>
                <input
                  {...register("city", { required: "City is required" })}
                  placeholder="Enter city"
                  className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 group-hover:border-blue-300 ${
                    errors.city
                      ? "border-red-400 focus:border-red-500"
                      : "border-gray-200 dark:border-gray-600 focus:border-blue-500"
                  }`}
                />
                {errors.city && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {/* {errors.city.message} */}
                  </p>
                )}
              </div>
            </div>

            {/* Address Field */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <svg
                  className="w-4 h-4 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                Full Address *
              </label>
              <textarea
                {...register("address", { required: "Address is required" })}
                placeholder="Enter complete address with landmarks"
                rows={3}
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 group-hover:border-blue-300 resize-none ${
                  errors.address
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-200 dark:border-gray-600 focus:border-blue-500"
                }`}
              />
              {errors.address && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {/* {errors.address.message} */}
                </p>
              )}
            </div>

            {/* State & Contact Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                  State *
                </label>
                <input
                  {...register("state", { required: "State is required" })}
                  placeholder="Enter state"
                  className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 group-hover:border-blue-300 ${
                    errors.state
                      ? "border-red-400 focus:border-red-500"
                      : "border-gray-200 dark:border-gray-600 focus:border-blue-500"
                  }`}
                />
                {errors.state && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {/* {errors.state.message} */}
                  </p>
                )}
              </div>

              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  Contact Number *
                </label>
                <input
                  {...register("contact", {
                    required: "Contact number is required",
                    pattern: {
                      value: /^[0-9]{10,}$/,
                      message: "Please enter a valid 10-digit number",
                    },
                  })}
                  placeholder="10-digit contact number"
                  className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 group-hover:border-blue-300 ${
                    errors.contact
                      ? "border-red-400 focus:border-red-500"
                      : "border-gray-200 dark:border-gray-600 focus:border-blue-500"
                  }`}
                />
                {errors.contact && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {/* {errors.contact.message} */}
                  </p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <svg
                  className="w-4 h-4 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Email Address *
              </label>
              <input
                {...register("email_id", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                    message: "Please enter a valid email address",
                  },
                })}
                placeholder="Enter email address"
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 group-hover:border-blue-300 ${
                  errors.email_id
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-200 dark:border-gray-600 focus:border-blue-500"
                }`}
              />
              {errors.email_id && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {/* {errors.email_id.message} */}
                </p>
              )}
            </div>

            {/* Image Upload Section */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                <svg
                  className="w-4 h-4 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                School Image (Optional)
              </label>

              <div className="relative">
                <label className="group cursor-pointer block">
                  <div
                    className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ${
                      imagePreview
                        ? "border-blue-300 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
                    }`}
                  >
                    {imagePreview ? (
                      <div className="relative group">
                        <img
                          src={imagePreview}
                          alt="School preview"
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="text-white text-center">
                            <svg
                              className="w-8 h-8 mx-auto mb-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                              />
                            </svg>
                            <p className="text-sm font-medium">Change Image</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                          <svg
                            className="w-8 h-8 text-blue-600 dark:text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Upload School Image
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Drag and drop or click to browse
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white py-4 px-8 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin w-5 h-5"
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
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5 group-hover:rotate-12 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6v6m6 6H6"
                        />
                      </svg>
                      <span>Add School</span>
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* Status Message */}
            {message && (
              <div
                className={`p-4 rounded-xl border transition-all duration-300 ${
                  message.includes("successfully")
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  {message.includes("successfully") ? (
                    <svg
                      className="w-5 h-5 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-red-600 dark:text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                  <span className="font-medium">{message}</span>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Additional Info Card */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/30">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Tips for Better Results
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>
                  • Ensure all contact information is accurate and up-to-date
                </li>
                <li>• Upload a clear, high-quality image of the school</li>
                <li>
                  • Double-check the email address for future communications
                </li>
                <li>
                  • Include complete address with postal code for better
                  location accuracy
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
