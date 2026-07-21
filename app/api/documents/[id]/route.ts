import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const document = await prisma.document.findUnique({
    where: { id },
    include: { shares: true },
  });

  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner = document.ownerId === userId;
  const isShared = document.shares.some((share: any) => share.userId === userId);

  if (!isOwner && !isShared) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const canEdit = isOwner || document.shares.some((share: any) => share.userId === userId && share.role === "EDITOR");

  return NextResponse.json({ ...document, isOwner, canEdit });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const document = await prisma.document.findUnique({
    where: { id },
    include: { shares: true },
  });

  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner = document.ownerId === userId;
  const isEditor = document.shares.some((share: any) => share.userId === userId && share.role === "EDITOR");

  if (!isOwner && !isEditor) {
    return NextResponse.json({ error: "Forbidden: You only have view access" }, { status: 403 });
  }

  const body = await req.json();
  const updateData: any = {};
  if (body.title !== undefined) updateData.title = body.title;
  if (body.content !== undefined) updateData.content = body.content;

  const updatedDocument = await prisma.document.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(updatedDocument);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (document.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden: Only the owner can delete this document" }, { status: 403 });
    }

    // Explicitly delete any shares first since we don't have cascade delete configured in prisma schema
    await prisma.documentShare.deleteMany({
      where: { documentId: id },
    });

    // Delete the document itself
    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete document:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
