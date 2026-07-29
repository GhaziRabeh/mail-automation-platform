import { prisma } from "../config/prisma";

import validator from "validator";

import { readExcel } from "./excel.service";

export async function importProspects(filePath: string) {
  const prospects = readExcel(filePath);

  let inserted = 0;

  let skipped = 0;

  for (const prospect of prospects) {
    if (!validator.isEmail(prospect.email)) {
      skipped++;

      continue;
    }

    const exists = await prisma.prospect.findUnique({
      where: {
        email: prospect.email,
      },
    });

    if (exists) {
      skipped++;

      continue;
    }

    await prisma.prospect.create({
      data: {
        company: prospect.company,

        email: prospect.email,

        website: prospect.website,

        country: prospect.country,

        linkedin: prospect.linkedin,

        contactName: prospect.contactName,
      },
    });

    inserted++;
  }

  return {
    inserted,

    skipped,
  };
}
