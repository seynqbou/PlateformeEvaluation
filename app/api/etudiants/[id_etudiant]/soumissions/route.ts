// app/api/etudiants/[id_etudiant]/soumissions/route.ts
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  request: Request,
  { params }: { params: { id_etudiant: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the user is the student or an admin/professor
    if (session.user.role === "etudiant" && session.user.id !== params.id_etudiant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const soumissions = await prisma.soumissions.findMany({
      where: { id_etudiant: params.id_etudiant },
      include: {
        exercices: true,
        fichiers: true,
        corrections: true,
      },
    });

    return NextResponse.json(soumissions);
  } catch (error) {
    console.error("Error fetching submissions for student:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}