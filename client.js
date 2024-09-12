// node --watch client.js
// ESTE ES EL MICROSERV Q SE VA A COMUNICAR CON EL CONSERVIDOR gRPC
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import taskRouter from "./src/modules/task/task.routes.js";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const PROTO_PATH = path.join(process.cwd(), "task.proto");
const PORT = process.env.PORT || 3000;
const GRPC_PORT = process.env.GRPC_PORT || 50051;

// -----------------  APIREST TASK ---------------------
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

mongoose.connect(process.env.DBUrl);

// Rutas API REST TASK
app.use(taskRouter);

app.listen(PORT, () => {
  console.log(`API REST TASK escuchando en http://localhost:${PORT}`);
});

// ----------------- COMUNICACION CON EL SERVIDOR gRPC ---------------------

// Configuracion del servidor gRPC
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const taskProto = grpc.loadPackageDefinition(packageDefinition).TaskService;

// Creo un cliente gRPC
const client = new taskProto(
  `localhost:${GRPC_PORT}`,
  grpc.credentials.createInsecure()
);
// Ruta para obtener el conteo de tareas desde el servidor gRPC
app.get("/task-count", (req, res) => {
  client.GetTaskStats({}, (error, response) => {
    if (error) {
      return res.status(500).send({ error: error.message });
    }
    res.send({ count: response.count });
  });
});

// Ruta para obtener el conteo de tareas x usuario desde el servidor gRPC
app.get("/task-user-count", (req, res) => {
  try {
    const idUser = req.query.idUser;

    client.GetTaskxUser({ idUser: idUser }, (error, response) => {
      if (error) {
        return res.status(500).send({ error: error.message });
      }
      res.send({ count: response.count });
    });
    console.log(response);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// TRAE LA CONVERSION DE USD desde el servidor gRPC (se le pasan los dolares)
app.get("/usd-convert", (req, res) => {
  try {
    const dolares = req.query.dolares;

    client.GetCotizaUsd({ dolares }, (error, response) => {
      if (error) {
        return res.status(500).send({ error: error.message });
      }

      res.send({ response });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// TRAE LAS COTIZACIONES DE BLUE (venta y compra)
app.get("/usdBlue", async (req, res) => {
  try {
    const response = await axios.get("https://api.bluelytics.com.ar/v2/latest");
    const data = response.data.blue;
    res.send({ data });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Exportar el cliente gRPC para poder utilizarlo desde routes
export default client;
