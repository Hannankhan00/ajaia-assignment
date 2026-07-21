import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: documentId } = await params;

    // Verify current user is the owner
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (document.ownerId !== userId) {
      return NextResponse.json({ error: "Only the owner can view shares" }, { status: 403 });
    }

    const shares = await prisma.documentShare.findMany({
      where: { documentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        user: {
          name: "asc"
        }
      }
    });

    return NextResponse.json(shares);
  } catch (error) {
    console.error("Failed to fetch shares:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
