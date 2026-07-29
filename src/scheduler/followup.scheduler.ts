import cron from "node-cron";

import { processFollowUps } from "../services/followup.service";

export function startFollowUpScheduler() {
  cron.schedule(
    "0 * * * *",

    async () => {
      console.log("Checking follow-ups...");

      await processFollowUps();
    },
  );
}
