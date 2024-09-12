// node --watch server.js
// ESTE ES EL SERVIDOR gRPC
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const PROTO_PATH = path.join(process.cwd(), "simple.proto");
const GRPC_PORT = process.env.GRPC_PORT || 50051;

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const simpleProto = grpc.loadPackageDefinition(packageDefinition).SimpleService;

function add(call, callback) {
  const { number1, number2 } = call.request;
  const result = number1 + number2;
  callback(null, { result });
}

function subtract(call, callback) {
  const { minuend, subtrahend } = call.request;
  const difference = minuend - subtrahend;
  callback(null, { difference });
}

// ACA IRIAN LOS OTROS METODOS...

//.....

// Inicializar y configurar el servidor gRPC
function main() {
  const server = new grpc.Server();

  // Registra ambos metodos
  server.addService(simpleProto.service, {
    Add: add,
    Subtract: subtract,
  });

  // Inicia el servidor en el puerto 50051
  server.bindAsync(
    `0.0.0.0:${GRPC_PORT}`,
    grpc.ServerCredentials.createInsecure(),
    () => {
      console.log(`Servidor gRPC escuchando en el puerto ${GRPC_PORT}`);
    }
  );
}

main();
