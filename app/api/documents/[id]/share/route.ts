import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: documentId } = await params;
    const body = await req.json();
    const { email, role = "VIEWER" } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (role !== "VIEWER" && role !== "EDITOR") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Verify current user is the owner
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (document.ownerId !== userId) {
      return NextResponse.json({ error: "Only the owner can share this document" }, { status: 403 });
    }

    // Find the user to share with
    const targetUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User with that email not found" }, { status: 404 });
    }

    if (targetUser.id === userId) {
      return NextResponse.json({ error: "You cannot share a document with yourself" }, { status: 400 });
    }

    // Check if already shared
    const existingShare = await prisma.documentShare.findUnique({
      where: {
        documentId_userId: {
          documentId,
          userId: targetUser.id,
        },
      },
    });

    if (existingShare) {
      // If already shared, we could potentially update the role, but for now we return 409
      return NextResponse.json({ error: "Document is already shared with this user" }, { status: 409 });
    }

    // Create the share
    const share = await prisma.documentShare.create({
      data: {
        documentId,
        userId: targetUser.id,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json(share);
  } catch (error) {
    console.error("Failed to share document:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
