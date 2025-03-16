// app/api/exercices/[id_exercice]/soumissions/route.ts
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
    request: Request,
    { params }: { params: { id_exercice: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "professeur") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const exercice = await prisma.exercices.findUnique({
          where: { id_exercice: params.id_exercice }
        });

        if (!exercice) {
          return NextResponse.json({ error: "Exercice not found" }, { status: 404 });
        }

        if (exercice.id_professeur !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }


        const soumissions = await prisma.soumissions.findMany({
            where: { id_exercice: params.id_exercice },
            include: {
                etudiants: true,
                fichiers: true,
                corrections: true,
            },
        });

        return NextResponse.json(soumissions);
    } catch (error) {
        console.error("Error fetching submissions for exercise:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}