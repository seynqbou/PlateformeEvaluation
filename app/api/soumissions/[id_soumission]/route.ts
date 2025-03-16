// app/api/soumissions/[id_soumission]/route.ts
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
    request: Request,
    { params }: { params: { id_soumission: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const soumission = await prisma.soumissions.findUnique({
            where: { id_soumission: params.id_soumission },
            include: {
                exercices: true,
                etudiants: true,
                fichiers: true,
                corrections: true,
            },
        });

        if (!soumission) {
            return NextResponse.json({ error: "Submission not found" }, { status: 404 });
        }

        // Authorization checks
        if (session.user.role === "etudiant" && soumission.id_etudiant !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        if (
            session.user.role === "professeur" &&
            soumission.exercices.id_professeur !== session.user.id
        ) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json(soumission);
    } catch (error) {
        console.error("Error fetching submission:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}