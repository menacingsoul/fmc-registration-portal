import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  branch: { type: String, required: true },
  yearOfAdmission: { type: String, required: true },
  rollNo: { type: String, required: true },
  pin: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
})

export default mongoose.models.User || mongoose.model('User', UserSchema)