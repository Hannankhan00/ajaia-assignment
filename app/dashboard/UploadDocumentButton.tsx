"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadDocumentButton() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleCardClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension !== "txt" && extension !== "md") {
      alert("Unsupported file type. Please upload a .txt or .md file.");
      e.target.value = ""; // Reset input
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/documents/${data.id}`);
      } else {
        alert(data.error || "Failed to upload document");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("An unexpected error occurred during upload.");
    } finally {
      setIsUploading(false);
      e.target.value = ""; // Reset input
    }
  };

  return (
    <>
      <div 
        onClick={isUploading ? undefined : handleCardClick}
        className={`w-40 h-52 bg-white border-2 border-gray-200 hover:border-orange-500 rounded flex flex-col items-center justify-center cursor-pointer hover:shadow-lg transition-all group overflow-hidden relative ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-gray-50 to-transparent"></div>
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform z-10">
          {isUploading ? (
            <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          )}
        </div>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".txt,.md" 
        className="hidden" 
      />
    </>
  );
}
