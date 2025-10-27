import { FilterQuery, Types } from 'mongoose';
import { Task, ITask, TaskPriority, TaskStatus } from '../models/Task';

export interface TaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  dueDate?: Date | string | null;
  priority?: TaskPriority;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  title?: string;
  dueDate?: string;
}

function ensureObjectId(id: string, label: string) {
  if (!Types.ObjectId.isValid(id)) {
    const err: any = new Error(`${label} invalido`);
    err.status = 400;
    throw err;
  }
}

function ensureOwnership(task: ITask, userId: string) {
  if (task.user.toString() !== userId) {
    const err: any = new Error('Operacao nao permitida para este recurso');
    err.status = 403;
    throw err;
  }
}

function normalizeDate(input?: string | Date | null) {
  if (!input) return undefined;
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) {
    const err: any = new Error('Data invalida');
    err.status = 400;
    throw err;
  }
  return date;
}

export async function createTask(userId: string, payload: TaskPayload) {
  ensureObjectId(userId, 'Usuario');

  const task = await Task.create({
    user: userId,
    title: payload.title,
    description: payload.description,
    status: payload.status ?? 'pending',
    dueDate: normalizeDate(payload.dueDate),
    priority: payload.priority ?? 'medium'
  });

  return task;
}

export async function listTasks(userId: string, filters: TaskFilters) {
  ensureObjectId(userId, 'Usuario');

  const query: FilterQuery<ITask> = { user: userId };

  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;
  if (filters.title) query.title = { $regex: filters.title, $options: 'i' };
  if (filters.dueDate) query.dueDate = normalizeDate(filters.dueDate);

  return Task.find(query).sort({ dueDate: 1, createdAt: -1 });
}

export async function findTask(userId: string, taskId: string) {
  ensureObjectId(userId, 'Usuario');
  ensureObjectId(taskId, 'ID da tarefa');

  const task = await Task.findById(taskId);
  if (!task) {
    const err: any = new Error('Tarefa nao encontrada');
    err.status = 404;
    throw err;
  }

  ensureOwnership(task, userId);
  return task;
}

export async function replaceTask(userId: string, taskId: string, payload: TaskPayload) {
  const task = await findTask(userId, taskId);

  task.title = payload.title;
  task.description = payload.description ?? undefined;
  task.status = payload.status ?? 'pending';
  task.dueDate = normalizeDate(payload.dueDate);
  task.priority = payload.priority ?? 'medium';

  return task.save();
}

export async function updateTask(userId: string, taskId: string, payload: Partial<TaskPayload>) {
  const task = await findTask(userId, taskId);

  if (payload.title !== undefined) task.title = payload.title;
  if (payload.description !== undefined) task.description = payload.description;
  if (payload.status !== undefined) task.status = payload.status;
  if (payload.dueDate !== undefined) task.dueDate = normalizeDate(payload.dueDate);
  if (payload.priority !== undefined) task.priority = payload.priority;

  return task.save();
}

export async function deleteTask(userId: string, taskId: string) {
  const task = await findTask(userId, taskId);
  await task.deleteOne();
  return task;
}
