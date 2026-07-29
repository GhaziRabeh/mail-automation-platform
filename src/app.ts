import express from "express";

import cors from "cors";

import helmet from "helmet";

import compression from "compression";

import morgan from "morgan";

import routes from "./routes";

import { notFoundMiddleware } from "./middlewares/notFound.middleware";

import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

// Security

app.use(helmet());

// CORS

app.use(
  cors({
    origin: "*",
  }),
);

// Body parser

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

// Compression

app.use(compression());

// Logger

app.use(morgan("dev"));

// API routes

app.use("/api", routes);

// 404

app.use(notFoundMiddleware);

// Errors

app.use(errorMiddleware);

export default app;
