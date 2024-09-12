import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import {
  getTaskCountService,
  getTaskxUserCountService,
} from "../task/task.service.js"; // OBTENGO LOS DATOS DESDE EL SERVICE DE TASK
import axios from "axios";

dotenv.config();

const PROTO_PATH = path.join(process.cwd(), "task.proto");
const GRPC_PORT = process.env.GRPC_PORT || 50051;
const DB_URL = process.env.DBUrl; // Asegúrate de tener la URL de la base de datos en el archivo .env

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const taskProto = grpc.loadPackageDefinition(packageDefinition).TaskService;

// FUNCIÓN CONTEO DE TAREAS
async function getTaskStats(call, callback) {
  try {
    const count = await getTaskCountService();
    callback(null, { count });
  } catch (error) {
    callback(error);
    console.log(error);
  }
}

async function getTaskxUser(call, callback) {
  const { idUser } = call.request;
  try {
    const count = await getTaskxUserCountService(idUser);
    callback(null, { count });
  } catch (error) {
    callback(error);
    console.log(error);
  }
}

// FUNCIION COTIZAUSD(recibe dolares como parametro y
// devuelve el valor en pesos y la diferencia en porcentaje entre el dolar venta y dolar compra)
async function getCotizaUsd(call, callback) {
  const { dolares } = call.request;
  try {
    const response = await axios.get("https://api.bluelytics.com.ar/v2/latest");
    const data = response.data.blue;

    console.log(data);

    // cotizaciones cpa y vta
    const usdValorCpa = data.value_buy;
    const usdValorVta = data.value_sell;
    const convertCpa = usdValorCpa * dolares;
    const convertVta = usdValorVta * dolares;

    // Calcula la diferencia en porcentaje
    const difference = convertVta - convertCpa;
    const percentage = ((difference / convertCpa) * 100).toFixed(2);
    const percentageDifference =
      percentage >= 0 ? `+${percentage}` : `-${percentage}`;

    // Devuelve los resultados
    callback(null, { data, convertCpa, convertVta, percentageDifference });
  } catch (error) {
    callback(error);
    console.log(error);
  }
}

// Inicializar y configurar el servidor gRPC
async function main() {
  try {
    // Conectar a la base de datos MongoDB
    await mongoose.connect(DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Conectado a la base de datos");

    const server = new grpc.Server();

    server.addService(taskProto.service, {
      GetTaskStats: getTaskStats,
      GetCotizaUsd: getCotizaUsd,
      GetTaskxUser: getTaskxUser,
      //otros metodos
    });

    server.bindAsync(
      `0.0.0.0:${GRPC_PORT}`,
      grpc.ServerCredentials.createInsecure(),
      () => {
        console.log(`Servidor gRPC escuchando en el puerto ${GRPC_PORT}`);
      }
    );
  } catch (error) {
    console.error("Error al conectar a la base de datos", error);
  }
}

main();
