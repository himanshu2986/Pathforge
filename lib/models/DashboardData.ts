import mongoose, { Schema } from 'mongoose';

const SkillSchema = new Schema({
  id: String,
  name: String,
  category: String,
  track: String,
  notes: String,
  level: Number,
  targetLevel: Number,
  lastUpdated: String,
});

const PortfolioProjectSchema = new Schema({
  id: String,
  title: String,
  description: String,
  skills: [String],
  url: String,
  imageUrl: String,
  createdAt: String,
  views: Number,
  likes: Number,
  stars: Number,
  forks: Number,
  lastViewed: String,
  category: String,
});

const LearningPathModuleSchema = new Schema({
  id: String,
  title: String,
  completed: Boolean,
});

const LearningPathSchema = new Schema({
  id: String,
  title: String,
  description: String,
  progress: Number,
  modules: [LearningPathModuleSchema],
});

const InternshipSchema = new Schema({
  id: String,
  company: String,
  role: String,
  location: String,
  type: { type: String, enum: ['remote', 'onsite', 'hybrid'] },
  matchScore: Number,
  skills: [String],
  deadline: String,
  applied: Boolean,
});

const DashboardDataSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    skills: [SkillSchema],
    portfolioProjects: [PortfolioProjectSchema],
    learningPaths: [LearningPathSchema],
    internships: [InternshipSchema],
    portfolioScore: { type: Number, default: 0 },
    weeklyProgress: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.DashboardData || mongoose.model('DashboardData', DashboardDataSchema);
