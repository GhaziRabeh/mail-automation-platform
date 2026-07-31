import "dotenv/config";

import express from "express";

import "./workers/email.worker";

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({
    service: "worker",
    status: "running"
  });
});

app.listen(PORT, () => {
  console.log(`Worker running on port ${PORT}`);
});

console.log("Email worker started");