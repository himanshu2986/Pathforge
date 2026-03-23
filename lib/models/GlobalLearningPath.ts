import mongoose, { Schema } from 'mongoose';

const QuizSchema = new Schema({
  question: String,
  options: [String],
  answer: Number // Index of correct option
});

const LearningPathModuleSchema = new Schema({
  id: String,
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  duration: { type: String },
  content: { type: String, default: '' },
  example: { type: String, default: '' },
  quiz: [QuizSchema],
});

const GlobalLearningPathSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    modules: [LearningPathModuleSchema],
    capstoneProject: {
      title: String,
      description: String,
      skills: [String]
    },
    category: { type: String, required: true },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.GlobalLearningPath || mongoose.model('GlobalLearningPath', GlobalLearningPathSchema);
