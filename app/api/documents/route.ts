import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let title = "Untitled Document";
  try {
    // Only try to parse if there's a body
    const text = await req.text();
    if (text) {
      const body = JSON.parse(text);
      if (body.title) title = body.title;
    }
  } catch (e) {
    console.error("Error parsing request body:", e);
  }

  try {
    const document = await prisma.document.create({
      data: {
        title,
        content: "",
        ownerId: userId,
      },
    });
    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [ownedDocuments, sharedDocumentsResult] = await Promise.all([
    prisma.document.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.documentShare.findMany({
      where: { userId },
      include: { document: true },
      orderBy: { document: { updatedAt: "desc" } },
    }),
  ]);

  const sharedDocuments = sharedDocumentsResult.map((share) => share.document);

  return NextResponse.json({ ownedDocuments, sharedDocuments });
}
