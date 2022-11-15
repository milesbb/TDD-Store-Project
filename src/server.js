import express from "express";
import cors from "cors";
import usersRouter from "./users/index.js";
import productsRouter from "./products/index.js";
import {
  forbiddenErrorHandler,
  genericErroHandler,
  notFoundErrorHandler,
  unauthorizedErrorHandler,
  badRequestErrorHandler,
} from "./errorHandlers.js";

const server = express();

server.use(cors());
server.use(express.json());

server.use("/users", usersRouter);
server.use("/products", productsRouter);

server.use(badRequestErrorHandler);
server.use(unauthorizedErrorHandler);
server.use(forbiddenErrorHandler);
server.use(notFoundErrorHandler);
server.use(genericErroHandler);

export default server;
