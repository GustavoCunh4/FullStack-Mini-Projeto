import mongoose, { Schema, Document, Types } from 'mongoose';

export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface ITask extends Document {
  user: Types.ObjectId;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: Date;
  priority?: TaskPriority;
}

const TaskSchema = new Schema<ITask>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending'
    },
    dueDate: { type: Date },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  },
  { timestamps: true }
);

TaskSchema.index({ user: 1, dueDate: 1 });
TaskSchema.index({ user: 1, status: 1 });

export const Task = mongoose.model<ITask>('Task', TaskSchema);
