import taskModel from "./MTask.js";

export async function findOneById(_id) {
  return await taskModel.findById(_id).exec();
}

export async function findTasksByUser(userId) {
  return await taskModel.find({ user: userId }).exec();
}

export async function findTasksAll() {
  return await taskModel.find().exec();
}

export async function save(user) {
  let _user = new taskModel(user);
  return await _user.save();
}

export async function update(id, updatedUser) {
  return await taskModel
    .findByIdAndUpdate(id, updatedUser, { new: true })
    .exec();
}

export async function remove(id) {
  return await taskModel.findOneAndDelete({ _id: id }).exec();
}

//OBTIENE LA CANTIDAD DE TAREAS QUE EXISTEN EN LA BD
export async function getTaskCountService() {
  return await taskModel.countDocuments().exec();
}
//OBTIENE LA CANTIDAD DE TAREAS x USER QUE EXISTEN EN LA BD
export async function getTaskxUserCountService(idUser) {
  try {
    return await taskModel.countDocuments({ user: idUser }).exec();
  } catch (error) {
    console.error("Error al obtener la cantidad de tareas por usuario:", error);
    throw error; // lanza el error
  }
}
