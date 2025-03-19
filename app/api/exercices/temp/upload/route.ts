// app/api/exercices/temp/upload/route.ts
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createLogger, format, transports } from 'winston';
import * as fs from 'fs';  // Import the 'fs' module

// Winston Logger setup
const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    defaultMeta: { service: 'file-upload' },
    transports: [
        new transports.File({ filename: 'file-upload-error.log', level: 'error' }),
        new transports.File({ filename: 'file-upload-combined.log' })
    ]
});

// Custom Multer-like middleware for file validation
const fileValidationMiddleware = async (file: File): Promise<void> => {
  const maxFileSize = 20 * 1024 * 1024; // 20MB
  const allowedMimeTypes = [
    'application/pdf',
    'text/plain',
    'text/markdown',
  ];

  // 1. Size Check
  if (file.size > maxFileSize) {
    throw new Error('FILE_TOO_LARGE');
  }

  // 2. Mime Type Check
  if (!allowedMimeTypes.includes(file.type)) {
     throw new Error('INVALID_MIME_TYPE');
  }

  // 3. File Extension Check (basic)
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !['pdf', 'txt', 'md'].includes(fileExtension)) {
        throw new Error("INVALID_FILE_EXTENSION");
    }

  // 4. Magic Number Check (more robust)
  const buffer = Buffer.from(await file.arrayBuffer());
    if (file.type === 'application/pdf' && !buffer.subarray(0, 4).equals(Buffer.from('%PDF'))) {
        throw new Error('INVALID_PDF_SIGNATURE');
    }
    if (file.type === 'text/plain' && !buffer.subarray(0,1).equals(Buffer.from([0xEF])) && !buffer.subarray(0,1).equals(Buffer.from([0xFE])) &&  !buffer.subarray(0,1).equals(Buffer.from([0xFF])))  { //Just a basic check for text.  Can't truly detect, but checking BOM.
       // console.log("Not a valid text file (BOM check)"); //Log for debug
    }


  // 5. Virus Scan Mock (Simulation)
  const virusScanMock = (buffer: Buffer): boolean => {
    // Simulate a virus scan - replace with a real virus scanning library
    const dangerousPattern = /virus|malware/i; // Example: simple regex
    return !dangerousPattern.test(buffer.toString('utf-8', 0, 1024)); // Check first 1KB
  };

  if (!virusScanMock(buffer)) {
    throw new Error('VIRUS_DETECTED');
  }
};

// Function to sanitize filenames
const sanitizeFilename = (filename: string): string => {
    // Remove potentially dangerous characters
    let sanitized = filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    // Prevent directory traversal
    sanitized = sanitized.replace(/\.\.+/g, '.');
    // Truncate excessively long filenames
    if (sanitized.length > 255) {
        const ext = sanitized.split('.').pop();
        sanitized = sanitized.substring(0, 255 - (ext ? ext.length + 1 : 0)) + (ext ? '.' + ext : '');
    }
    return sanitized;
};

export async function POST(request: Request) {
  const startTime = Date.now();
  let exerciceId: string | null = null;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !('role' in session.user)) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    const user = session.user as { id: string; role: string };

    if (!['professeur', 'administrateur'].includes(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const isReferenceCorrection = data.get('isReference') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Custom Validation
    await fileValidationMiddleware(file);

    const uniqueFilename = `${uuidv4()}-${sanitizeFilename(file.name)}`;
    const uploadDir = join(process.cwd(), 'public/uploads/temp');

    // Ensure the directory exists recursively
    await mkdir(uploadDir, { recursive: true });
    fs.chmodSync(uploadDir, 0o755);  //Ensure correct permissions


      // Find an existing and active course.  This is MUCH better than hardcoding.
      const firstActiveCourse = await prisma.cours.findFirst({
        where: {
            actif: true,
            // Add other conditions if needed, e.g., belonging to the professor
            // id_professeur: session.user.id,
        },
      });

      if (!firstActiveCourse) {
        return NextResponse.json({ error: "Aucun cours actif trouvé." }, { status: 400 });
      }

        // Create a *temporary* exercise.
        const tempExercice = await prisma.exercices.create({
        data: {
            titre: "Temp Exercise",
            description: "Temp Description",
            id_professeur: user.id,
            id_cours: firstActiveCourse.id_cours, // Use a VALID course ID
            format_reponse_attendu: "texte",
            visible_aux_etudiants: false,
        },
        });
        exerciceId = tempExercice.id_exercice; // Use the temporary ID.


    const filePath = join(uploadDir, uniqueFilename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);
    fs.chmodSync(filePath, 0o644); // Correct permissions.

    const fichier = await prisma.fichiers.create({
        data: {
            nom: file.name,
            type_mime: file.type,
            taille: file.size,
            chemin: filePath, // Store relative path
            televersee_par: user.id,
        },
      });

    await prisma.exercice_fichier.create({
    data: {
        id_exercice: exerciceId,
        id_fichier: fichier.id_fichier,
    }
    });


    if (isReferenceCorrection) {
    // Create new correction reference
    const correctionRef = await prisma.corrections_reference.create({
        data: {
        id_exercice: exerciceId,
        id_professeur: user.id,
        contenu: "Correction de référence",
        },
    });

    // Link file to correction
    await prisma.correction_reference_fichier.create({
        data: {
        id_correction: correctionRef.id_correction,
        id_fichier: fichier.id_fichier,
        },
    });
    }

    const endTime = Date.now();
    logger.info(
      `File ${uniqueFilename} uploaded for exercise ${exerciceId} by user ${user.id} in ${
        endTime - startTime
      }ms`
    );
    return NextResponse.json(
        { success: true, fileId: fichier.id_fichier, exerciceId: exerciceId },
        { status: 201 }
      );

  } catch (error: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;
    const errorMessage = error.message || 'Unknown error';
    logger.error(
      `File upload failed after ${duration}ms: ${errorMessage}`,
      { error }
    );

    switch (errorMessage) {
      case 'FILE_TOO_LARGE':
        return NextResponse.json({ error: 'Fichier trop volumineux' }, { status: 413 });
      case 'INVALID_MIME_TYPE':
          return NextResponse.json({ error: "Type MIME invalide" }, {status: 415});
        case 'INVALID_FILE_EXTENSION':
            return NextResponse.json({ error: "Extension de fichier invalide"}, {status: 415});
      case 'INVALID_PDF_SIGNATURE':
        return NextResponse.json({ error: 'Signature PDF invalide' }, { status: 400 });
      case 'VIRUS_DETECTED':
        return NextResponse.json({ error: 'Virus détecté (simulation)' }, { status: 400 });
      default:
        return NextResponse.json(
          { error: `Erreur lors du téléversement: ${errorMessage}` },
          { status: 500 }
        );
    }
  }
}


// Scheduled task for cleaning up old temporary files
const cleanupTempFiles = async () => {
  const uploadDir = join(process.cwd(), 'public/uploads/temp');
  try {
    const files = await fs.promises.readdir(uploadDir);
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;

    for (const file of files) {
      const filePath = join(uploadDir, file);
      const stat = await fs.promises.stat(filePath);

      if (stat.isFile() && stat.mtimeMs < twentyFourHoursAgo) {
        await unlink(filePath);
        logger.info(`Deleted old temporary file: ${file}`);
      }
    }
  } catch (error) {
    logger.error('Error during temporary file cleanup:', error);
  }
};

// Run cleanup every hour.  Could also use a cron library.
setInterval(cleanupTempFiles, 60 * 60 * 1000);