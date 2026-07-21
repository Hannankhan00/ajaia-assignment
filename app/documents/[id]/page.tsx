"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import FontFamily from "@tiptap/extension-font-family";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { FontSize } from "./FontSize";
import ShareModal from "@/components/ShareModal";
import { Node, mergeAttributes } from "@tiptap/core";

type SaveStatus = "Saved" | "Saving..." | "Unsaved changes" | "View Only";

const PAGE_SIZES = {
  Letter: { width: "816px", height: "1056px" },
  A4: { width: "794px", height: "1123px" },
  A3: { width: "1123px", height: "1587px" },
  Legal: { width: "816px", height: "1344px" },
};
type PageSize = keyof typeof PAGE_SIZES;

export default function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [document, setDocument] = useState<{ title: string; content: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<SaveStatus>("Saved");
  const [isOwner, setIsOwner] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  
  // Share Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // Track current formatting for toolbar
  const [currentFont, setCurrentFont] = useState("");
  const [currentSize, setCurrentSize] = useState("");
  const [currentColor, setCurrentColor] = useState("#000000");
  
  // Menus and Settings
  const [pageSize, setPageSize] = useState<PageSize>("Letter");
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit, 
      Underline,
      TextStyle,
      FontFamily,
      FontSize,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: "",
    onUpdate: () => {
      setStatus("Unsaved changes");
    },
    onTransaction: ({ editor }) => {
      // Update toolbar state when cursor moves or formatting changes
      setCurrentFont(editor.getAttributes('textStyle').fontFamily || "");
      setCurrentSize(editor.getAttributes('textStyle').fontSize || "");
      setCurrentColor(editor.getAttributes('textStyle').color || "#000000");
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none py-10 px-8 text-black w-full h-full",
      },
    },
  });

  useEffect(() => {
    async function fetchDoc() {
      try {
        const res = await fetch(`/api/documents/${id}`);
        if (res.ok) {
          const data = await res.json();
          setDocument(data);
          setIsOwner(data.isOwner || false);
          setCanEdit(data.canEdit || false);
          
          if (!data.canEdit) {
            setStatus("View Only");
          }

          if (editor && data.content) {
            editor.commands.setContent(data.content);
            editor.setEditable(data.canEdit || false);
          }
        } else if (res.status === 403) {
          router.push("/dashboard?error=forbidden");
        } else {
          setError("Document not found or you don't have permission.");
        }
      } catch {
        setError("Failed to load document.");
      } finally {
        setLoading(false);
      }
    }
    fetchDoc();
  }, [id, router, editor]);

  const handleManualSave = async () => {
    if (!editor || status === "Saved" || status === "View Only") return;
    setStatus("Saving...");
    try {
      const htmlContent = editor.getHTML();
      const res = await fetch(`/api/documents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: document?.title, content: htmlContent }),
      });
      if (res.ok) {
        setStatus("Saved");
      } else {
        setStatus("Unsaved changes");
        console.error("Save failed");
      }
    } catch (err) {
      console.error("Failed to save", err);
      setStatus("Unsaved changes");
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!document) return;
    setDocument({ ...document, title: e.target.value });
    setStatus("Unsaved changes");
  };

  const handleCreateNew = async () => {
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled Document" }),
      });
      if (res.ok) {
        const doc = await res.json();
        router.push(`/documents/${doc.id}`);
      }
    } catch (err) {
      console.error(err);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-black">
        <svg className="animate-spin h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center border-2 border-gray-200">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-black font-medium mb-6">{error}</p>
          <Link href="/dashboard" className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-lg hover:from-yellow-300 hover:to-orange-400 transition-all shadow-md">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-black font-sans flex flex-col">
      
      {/* Sticky Header and Toolbar Container */}
      <div className="sticky top-0 z-10 flex flex-col w-full shadow-sm print:hidden">
        {/* Editor Header */}
        <header className="flex items-center justify-between px-4 py-2 bg-white border-b-2 border-gray-200">
          <div className="flex items-center space-x-3 w-full">
            <Link href="/dashboard" className="w-10 h-10 rounded bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow shrink-0">
              <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </Link>
            
            <div className="flex flex-col">
              <input
                type="text"
                value={document.title}
                onChange={handleTitleChange}
                disabled={!canEdit}
                className="text-lg font-bold text-black border-none focus:outline-none focus:ring-1 focus:ring-orange-500 rounded px-2 py-0.5 w-full bg-transparent hover:bg-gray-50 transition-colors"
                placeholder="Untitled Document"
              />
              <div className="flex space-x-4 px-2 text-xs font-medium text-gray-500 mt-0.5 relative">
                {/* File Menu Dropdown */}
                <div className="relative">
                  <span 
                    className="hover:text-black cursor-pointer px-1 py-0.5 rounded hover:bg-gray-100 transition-colors"
                    onClick={() => setIsFileMenuOpen(!isFileMenuOpen)}
                  >
                    File
                  </span>
                  
                  {isFileMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsFileMenuOpen(false)}></div>
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg z-50 py-1">
                        <Link 
                          href="/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors cursor-pointer"
                          onClick={() => setIsFileMenuOpen(false)}
                        >
                          Open document
                        </Link>
                        <div 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors cursor-pointer"
                          onClick={() => { setIsFileMenuOpen(false); handleCreateNew(); }}
                        >
                          Create new
                        </div>

                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Page Size Selector */}
            <select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value as PageSize)}
              className="text-xs font-bold bg-gray-100 text-gray-700 border-none rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer hidden sm:block shadow-sm"
            >
              <option value="Letter">Letter</option>
              <option value="A4">A4</option>
              <option value="A3">A3</option>
              <option value="Legal">Legal</option>
            </select>
            {status === "Saved" && (
              <div className="flex items-center text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                <svg className="w-4 h-4 mr-1.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved
              </div>
            )}
            {status === "View Only" && (
              <div className="flex items-center text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                <svg className="w-4 h-4 mr-1.5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Only
              </div>
            )}
            {canEdit && (
              <button 
                onClick={handleManualSave}
                disabled={status === "Saving..." || status === "Saved"}
                className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-lg hover:from-yellow-300 hover:to-orange-400 transition-all shadow-sm shrink-0 disabled:opacity-50"
              >
                Save
              </button>
            )}
            {isOwner && (
              <button 
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center space-x-1 px-4 py-2 bg-gray-100 text-black font-bold rounded-full hover:bg-gray-200 transition-all shadow-sm shrink-0"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
                <span className="hidden sm:inline">Share</span>
              </button>
            )}
          </div>
        </header>

        {/* Editor Toolbar */}
        {editor && canEdit && (
          <div className="bg-white border-b-2 border-gray-200 px-4 py-2 flex items-center space-x-2 overflow-x-auto relative flex-wrap gap-y-2">
          
          {/* Font Family */}
          <select
            onChange={(e) => {
              if (e.target.value === "") {
                editor.chain().focus().unsetFontFamily().run();
              } else {
                editor.chain().focus().setFontFamily(e.target.value).run();
              }
            }}
            value={currentFont}
            className="p-1.5 rounded border border-gray-300 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
          >
            <option value="">Default Font</option>
            <option value="Inter">Inter</option>
            <option value="Arial">Arial</option>
            <option value="'Courier New', Courier, monospace">Courier New</option>
            <option value="'Times New Roman', Times, serif">Times New Roman</option>
            <option value="'Comic Sans MS', 'Comic Sans', cursive">Comic Sans</option>
          </select>

          {/* Font Size */}
          <select
            onChange={(e) => {
              if (e.target.value === "") {
                editor.chain().focus().unsetFontSize().run();
              } else {
                editor.chain().focus().setFontSize(e.target.value).run();
              }
            }}
            value={currentSize}
            className="p-1.5 rounded border border-gray-300 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer w-20"
          >
            <option value="">Size</option>
            <option value="12px">12</option>
            <option value="14px">14</option>
            <option value="16px">16</option>
            <option value="18px">18</option>
            <option value="20px">20</option>
            <option value="24px">24</option>
            <option value="30px">30</option>
            <option value="36px">36</option>
          </select>

          {/* Font Color */}
          <div className="relative flex items-center group ml-1">
            <input
              type="color"
              value={currentColor}
              onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
              className="w-7 h-7 p-0 border-0 rounded cursor-pointer"
              title="Text Color"
            />
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1 hidden sm:block"></div>

          {/* Text Styles */}
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded font-bold text-sm ${editor.isActive('bold') ? 'bg-orange-100 text-orange-600' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            B
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded italic text-sm font-serif ${editor.isActive('italic') ? 'bg-orange-100 text-orange-600' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            I
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded underline text-sm ${editor.isActive('underline') ? 'bg-orange-100 text-orange-600' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            U
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1 hidden sm:block"></div>
          
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded font-bold text-sm ${editor.isActive('heading', { level: 1 }) ? 'bg-orange-100 text-orange-600' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            H1
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded font-bold text-sm ${editor.isActive('heading', { level: 2 }) ? 'bg-orange-100 text-orange-600' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            H2
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-1 hidden sm:block"></div>

          {/* Alignment */}
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded flex items-center justify-center ${editor.isActive({ textAlign: 'left' }) ? 'bg-orange-100 text-orange-600' : 'text-gray-700 hover:bg-gray-100'}`}
            title="Align Left"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded flex items-center justify-center ${editor.isActive({ textAlign: 'center' }) ? 'bg-orange-100 text-orange-600' : 'text-gray-700 hover:bg-gray-100'}`}
            title="Align Center"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M4 18h16" />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded flex items-center justify-center ${editor.isActive({ textAlign: 'right' }) ? 'bg-orange-100 text-orange-600' : 'text-gray-700 hover:bg-gray-100'}`}
            title="Align Right"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M4 18h16" />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`p-2 rounded flex items-center justify-center ${editor.isActive({ textAlign: 'justify' }) ? 'bg-orange-100 text-orange-600' : 'text-gray-700 hover:bg-gray-100'}`}
            title="Justify"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1 hidden sm:block"></div>

          {/* Lists */}
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded flex items-center justify-center ${editor.isActive('bulletList') ? 'bg-orange-100 text-orange-600' : 'text-gray-700 hover:bg-gray-100'}`}
            title="Bullet List"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded flex items-center justify-center ${editor.isActive('orderedList') ? 'bg-orange-100 text-orange-600' : 'text-gray-700 hover:bg-gray-100'}`}
            title="Numbered List"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h12M8 12h12M8 18h12" />
              <text x="2" y="7" fontSize="5" fill="currentColor" stroke="none">1</text>
              <text x="2" y="13" fontSize="5" fill="currentColor" stroke="none">2</text>
              <text x="2" y="19" fontSize="5" fill="currentColor" stroke="none">3</text>
            </svg>
          </button>
          </div>
        )}
      </div>

      {/* Editor Canvas */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-gray-100 print:bg-white print:p-0 print:block">
        <div 
          id="document-canvas"
          style={{ 
            width: PAGE_SIZES[pageSize].width, 
            minHeight: PAGE_SIZES[pageSize].height,
            maxWidth: '100%' 
          }}
          className="bg-white shadow-md border border-gray-200 transition-all duration-300 ease-in-out flex flex-col print:shadow-none print:border-none print:m-0 print:w-full print:min-h-full"
        >
          <EditorContent editor={editor} className="flex-1 flex flex-col [&>div]:flex-1" />
        </div>
      </main>

      {/* Share Modal */}
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        documentId={id as string} 
      />
    </div>
  );
}
