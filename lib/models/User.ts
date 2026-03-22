import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    avatar: { type: String, default: '' },
    role: { type: String, default: 'student', enum: ['student', 'admin'] },
    resetToken: { type: String, required: false },
    resetTokenExpiry: { type: Date, required: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
