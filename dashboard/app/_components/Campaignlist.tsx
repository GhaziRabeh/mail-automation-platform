"use client";

import { motion, type Variants } from "framer-motion";
import ProspectTable from "./ProspectTable";
import StartCampaign from "./Startcampaign";
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
        <motion.div variants={item}>
          <StartCampaign />
        </motion.div>

        <motion.div variants={item}>
          <ProspectTable />
        </motion.div>
      </motion.div>
    </main>
  );
}
