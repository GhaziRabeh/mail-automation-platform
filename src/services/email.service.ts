import fs from "fs";

import path from "path";

import { transporter } from "../config/mail";

function loadTemplate() {
  const filePath = path.join(process.cwd(), "src/templates/partnership.html");

  return fs.readFileSync(filePath, "utf-8");
}

function replaceVariables(template: string, data: any) {
  return template

    .replace("{{company}}", data.company)

    .replace("{{reason}}", data.reason || "web development");
}

export async function sendEmail(data: {
  email: string;
  company: string;
  reason?: string;
}) {
  const template = loadTemplate();

  const html = replaceVariables(template, data);

  const result = await transporter.sendMail({
    from: `"Ghazi Rabeh" <${process.env.EMAIL}>`,

    to: data.email,

    subject: "Web Development & Maintenance Partnership Proposal",

    html,
  });

  return result;
}
