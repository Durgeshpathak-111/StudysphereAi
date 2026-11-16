import mongoose from 'mongoose';

const unitSchema = new mongoose.Schema({
  unitNumber: { type: Number, required: true },
  title: { type: String, required: true, trim: true },
  topics: [{ type: String, trim: true }]
});

const subjectSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true, uppercase: true, default: '' },
    semester: { type: Number, required: true, min: 1, max: 12 },
    description: { type: String, trim: true, default: '' },
    units: [unitSchema]
  },
  { timestamps: true }
);

export const Subject = mongoose.model('Subject', subjectSchema);