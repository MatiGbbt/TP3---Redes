import express from "express";
import {
  findOneById,
  findTasksByUser,
  findTasksAll,
  save,
  update,
  remove,
} from "./task.service.js";

import client from "../../../client.js";

const app = express();
const router = express.Router();

app.use(express.json());

// GET /api/task (Tarea x ID)
router.get("/api/task", async (req, res) => {
  try {
    const { taskId } = req.query;
    const task = await findOneById(taskId);

    return res.status(200).send(task);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

// GET /api/task/user (Tareas x idUser)
router.get("/api/task/user", async (req, res) => {
  try {
    const { idUser } = req.query;
    const tasks = await findTasksByUser(idUser); //Las tareas de un usuario

    return res.status(200).send(tasks);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

// GET /api/task (Todas las Tareas)
router.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await findTasksAll();

    return res.status(200).send(tasks);
  } catch (error) {
    console.log(error);

    return res.status(500).send(error);
  }
});

// POST /api/task (crear una Tarea)
router.post("/api/task", async (req, res) => {
  try {
    const { name, description, user, resume } = req.body;

    const TaskNw = {
      name,
      description,
      user,
      resume,
    };

    const taskResp = await save(TaskNw);

    return res.status(201).send(taskResp);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

// PUT /api/task (Actualizar una Tarea)
router.put("/api/task", async (req, res) => {
  try {
    const { taskId } = req.query;

    const updatedTsk = req.body;
    await update(taskId, updatedTsk);

    return res.status(200).send("Task updated successfully.");
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

// DELETE /api/task (Eliminar una Tarea)
router.delete("/api/task", async (req, res) => {
  try {
    const { taskId } = req.query;

    await remove(taskId);

    return res.status(200).send("Task deleted successfully.");
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

// COMUNICA CON EL SERVIDOR gRCP (src/modules/stats/stats.js) Y RETORNA LA CANTIDAD DE TAREAS QUE EXISTEN EN LA BD
router.get("/api/taskStats", async (req, res) => {
  client.GetTaskCount({}, (error, response) => {
    if (!error) {
      res.status(200).send({ CantidadTareas: response.count });
    } else {
      console.error("Error:", error);
      res.status(500).send(error);
    }
  });
});

export default router;
