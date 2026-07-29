import XLSX from "xlsx";
import validator from "validator";

import { prisma } from "../config/prisma";

export async function importExcel(filePath: string) {
  const workbook = XLSX.readFile(filePath);

  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const rows = XLSX.utils.sheet_to_json<any>(sheet);

  let imported = 0;
  let duplicated = 0;
  let invalid = 0;

  for (const row of rows) {
    const email = row.Email?.trim();

    if (!email || !validator.isEmail(email)) {
      invalid++;

      continue;
    }

    const exists = await prisma.prospect.findUnique({
      where: {
        email,
      },
    });

    if (exists) {
      duplicated++;

      continue;
    }

    await prisma.prospect.create({
      data: {
        company: row.Company || "Unknown",

        country: row.Country || null,

        website: row.Website || null,

        email,

        notes: row["Reason for Contact"] || null,

        status: "PENDING",
      },
    });

    imported++;
  }

  return {
    imported,

    duplicated,

    invalid,

    total: rows.length,
  };
}
