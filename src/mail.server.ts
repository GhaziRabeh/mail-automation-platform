import "dotenv/config";

import express from "express";

import { startEmailListener } from "./mail/email.listener";

const app = express();

const PORT = process.env.PORT || 3000;


app.get("/", (req,res)=>{
  res.json({
    service:"mail-listener",
    status:"running"
  });
});


app.listen(PORT,()=>{
  console.log(`Mail listener running on port ${PORT}`);
});


startEmailListener()
.then(()=>{
  console.log("IMAP listener started");
})
.catch(console.error);