import mongoose, { Schema } from 'mongoose';

const GlobalLearningPathSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    modules: [
      {
        title: { type: String, required: true },
        duration: { type: String },
        content: { type: String, default: '' },
        example: { type: String, default: '' },
      }
    ],
    category: { type: String, required: true },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.GlobalLearningPath || mongoose.model('GlobalLearningPath', GlobalLearningPathSchema);
