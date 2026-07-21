import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { marked } from "marked";

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const filename = file.name;
    const extension = filename.split(".").pop()?.toLowerCase();

    if (extension !== "txt" && extension !== "md") {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a .txt or .md file." },
        { status: 400 }
      );
    }

    const textContent = await file.text();
    let htmlContent = "";

    if (extension === "md") {
      // Parse markdown to HTML
      htmlContent = await marked.parse(textContent);
    } else if (extension === "txt") {
      // Convert plain text to paragraphs
      const lines = textContent.split(/\r?\n/);
      htmlContent = lines
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed) return "<p><br></p>"; // Empty lines become empty paragraphs
          // Escape HTML characters to prevent XSS from txt files
          const escaped = trimmed
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
          return `<p>${escaped}</p>`;
        })
        .join("");
    }

    const titleWithoutExt = filename.replace(/\.[^/.]+$/, "");

    const newDocument = await prisma.document.create({
      data: {
        title: titleWithoutExt || "Untitled Document",
        content: htmlContent,
        ownerId: userId,
      },
    });

    return NextResponse.json({ id: newDocument.id }, { status: 201 });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
