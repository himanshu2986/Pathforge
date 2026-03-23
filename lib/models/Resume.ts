import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  data: {
    personalInfo: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      website: { type: String, default: '' },
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      summary: { type: String, default: '' },
      photo: { type: String, default: '' },
    },
    experience: [{
      id: String,
      company: String,
      role: String,
      period: String,
      bullets: [String],
    }],
    education: [{
      id: String,
      school: String,
      degree: String,
      period: String,
    }],
    skills: [{ name: String, level: Number }],
    interests: [String],
    projects: [{
      id: String,
      title: String,
      description: String,
      skills: [String],
    }],
    sections: [{
      id: String,
      title: String,
      content: String,
      visible: { type: Boolean, default: true }
    }]
  },
  settings: {
    template: { type: String, default: 'professional' },
    primaryColor: { type: String, default: '#0ea5e9' },
    fontFamily: { type: String, default: 'sans' },
    lineHeight: { type: Number, default: 1.5 },
    marginSize: { type: Number, default: 2.5 }, // in rem
  },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Resume || mongoose.model('Resume', resumeSchema);
