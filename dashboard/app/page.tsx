"use client";

import { motion, type Variants } from "framer-motion";
import ExcelUpload from "./_components/ExcelUpload";
import Stats from "./_components/Stats";
import ProspectTable from "./_components/ProspectTable";
import ThemeToggle from "./theme/Themetoggle";
import CampaignList from "./_components/Campaignlist";

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-background px-6 py-10 sm:px-10">
      <motion.div
        className="mx-auto flex max-w-5xl flex-col gap-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.header
          variants={item}
          className="flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted">
              Outbound
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              Mail Automation
            </h1>
          </div>

          <ThemeToggle />
        </motion.header>

        <motion.div variants={item}>
          <ExcelUpload />
        </motion.div>

        <motion.div variants={item}>
          <Stats />
        </motion.div>

        <motion.div variants={item}>
          <CampaignList />
        </motion.div>

        <motion.div variants={item}>
          <ProspectTable />
        </motion.div>
      </motion.div>
    </main>
  );
}
