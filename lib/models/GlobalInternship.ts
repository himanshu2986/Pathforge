import mongoose, { Schema } from 'mongoose';

const GlobalInternshipSchema = new Schema(
  {
    company: { type: String, required: true },
    role: { type: String, required: true },
    location: { type: String, required: true },
    type: { type: String, enum: ['remote', 'onsite', 'hybrid'], required: true },
    matchScore: { type: Number, default: 85 },
    skills: [String],
    deadline: { type: String, required: true },
    description: { type: String },
    stipend: { type: String },
    requirements: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.GlobalInternship || mongoose.model('GlobalInternship', GlobalInternshipSchema);
