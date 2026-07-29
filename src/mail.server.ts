import "dotenv/config";

import { startEmailListener } from "./mail/email.listener";

console.log("Mail listener started");

startEmailListener();
