// app/api/corrections/[id_correction]/route.ts
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import * as z from "zod";

const correctionUpdateSchema = z.object({
  note: z.number().min(0).max(20).optional(),
  commentaire: z.string().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: { id_correction: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "professeur") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const id_correction = params.id_correction;

    // Validate request body
    const body = await request.json();
    const validatedData = correctionUpdateSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validatedData.error },
        { status: 400 }
      );
    }

    // Find the correction and its associated exercise
    const correction = await prisma.corrections.findUnique({
      where: { id_correction },
      include: {
        soumissions: {
          include: {
            exercices: true,
          },
        },
      },
    });

    if (!correction) {
      return NextResponse.json({ error: "Correction not found" }, { status: 404 });
    }

    // Authorization check: Make sure the professor owns the exercise
    if (correction.soumissions.exercices.id_professeur !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update the correction
    const updatedCorrection = await prisma.corrections.update({
      where: { id_correction },
      data: {
        note: validatedData.data.note,
        commentaire: validatedData.data.commentaire,
        ajuste_par_professeur: true,
      },
    });

    return NextResponse.json(updatedCorrection);
  } catch (error) {
    console.error("Error updating correction:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}