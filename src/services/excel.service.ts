import XLSX from "xlsx";

export interface ExcelProspect {
  company: string;

  email: string;

  website?: string;

  country?: string;

  linkedin?: string;

  contactName?: string;
}

export function readExcel(filePath: string): ExcelProspect[] {
  const workbook = XLSX.readFile(filePath);

  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const data = XLSX.utils.sheet_to_json(sheet);

  return data.map((row: any) => ({
    company: row.Company || row.company || "",

    email: row.Email || row.email || "",

    website: row.Website || row.website,

    country: row.Country || row.country,

    linkedin: row.LinkedIn || row.linkedin,

    contactName: row.Name || row.name,
  }));
}
