"use client";

import React, { useState, useEffect, useCallback } from "react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
}

export default function ShareModal({ isOpen, onClose, documentId }: ShareModalProps) {
  const [shareEmail, setShareEmail] = useState("");
  const [shareRole, setShareRole] = useState<"VIEWER" | "EDITOR">("VIEWER");
  const [shareStatus, setShareStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [shareMessage, setShareMessage] = useState("");
  const [shares, setShares] = useState<{ id: string; user: { name: string; email: string }; role: string }[]>([]);

  const fetchShares = useCallback(async () => {
    try {
      const res = await fetch(`/api/documents/${documentId}/shares`);
      if (res.ok) {
        const data = await res.json();
        setShares(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [documentId]);

  useEffect(() => {
    if (isOpen && documentId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchShares();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, documentId]);

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShareStatus("loading");
    setShareMessage("");
    
    try {
      const res = await fetch(`/api/documents/${documentId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: shareEmail, role: shareRole }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setShareStatus("success");
        setShareMessage("Document shared successfully!");
        setShareEmail("");
        fetchShares();
      } else {
        setShareStatus("error");
        setShareMessage(data.error || "Failed to share document");
      }
    } catch {
      setShareStatus("error");
      setShareMessage("An unexpected error occurred");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-md" onClick={(e) => { e.stopPropagation(); }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-black">Share Document</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <form onSubmit={handleShareSubmit} className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">Add people</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="Enter email address"
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-black"
                required
              />
              <select
                value={shareRole}
                onChange={(e) => setShareRole(e.target.value as "VIEWER" | "EDITOR")}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 text-black font-medium"
              >
                <option value="VIEWER">Viewer</option>
                <option value="EDITOR">Editor</option>
              </select>
              <button
                type="submit"
                disabled={shareStatus === "loading"}
                className="px-4 py-2 bg-black text-white font-bold rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {shareStatus === "loading" ? "..." : "Share"}
              </button>
            </div>
            {shareMessage && (
              <p className={`mt-2 text-sm font-medium ${shareStatus === "success" ? "text-green-600" : "text-red-600"}`}>
                {shareMessage}
              </p>
            )}
          </form>

          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3">People with access</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-black font-bold text-sm">
                    You
                  </div>
                  <div>
                    <p className="text-sm font-bold text-black">You (Owner)</p>
                  </div>
                </div>
              </div>
              
              {shares.map((share) => (
                <div key={share.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-sm uppercase">
                      {share.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-black">{share.user.name}</p>
                      <p className="text-xs text-gray-500">{share.user.email}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {share.role === "EDITOR" ? "Editor" : "Viewer"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 text-black font-bold rounded hover:bg-gray-50 transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
