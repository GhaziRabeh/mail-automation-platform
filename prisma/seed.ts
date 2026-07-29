import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.campaign.create({
    data: {
      name: "Web Development Partnership Campaign",

      subject: "Web Development & Maintenance Partnership Proposal",

      template: `

Hello {{company}} Team,


My name is Ghazi Rabeh, I am a Full Stack Developer specialized in modern web applications, backend systems, and performance optimization.


I am reaching out because I noticed that your company works in:

{{reason}}


I can help your team with:


• Website and application maintenance

• Bug fixing and performance improvements

• Modernization of existing applications

• New feature development

• API integrations

• React / Next.js / Node.js / Spring Boot development

• Technical support when your team needs additional resources


I would be happy to work as an external development partner and support your projects whenever you need additional development capacity.


If you are interested, I would be glad to schedule a short call and discuss possible collaboration.


Best regards,


Ghazi Rabeh

Full Stack Developer

Email:
rabehghazi81@gmail.com

`,
    },
  });

  console.log("Campaign created");
}

main()
  .catch((error) => {
    console.error(error);
  })

  .finally(async () => {
    await prisma.$disconnect();
  });
