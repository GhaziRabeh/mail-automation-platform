import express from "express";
import cors from "cors";
import http from "http";

import { initSocket } from "../socket/socket.server";
import prospectRoutes from "./prospect.routes";


const app = express();

app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  }),
);

app.use(express.json());

// API routes

app.use("/api", prospectRoutes);

// HTTP SERVER

const server = http.createServer(app);

// SOCKET.IO

initSocket(server);

server.listen(3000, () => {
  console.log("API + Socket running on port 3000");
});
