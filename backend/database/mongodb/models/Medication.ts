import mongoose, { Schema, Document } from 'mongoose';

export interface IMedication extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  purpose: string;
  disease: string[];
  category: string;
  categories?: string[];
  sideEffects: string;
  dosage: string[];
  contraindications: string[];
  interactions: string[];
  howItWorks: string;
  whenToTake: string;
  warnings: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MedicationSchema = new Schema<IMedication>(
  {
    name: { type: String, required: true, unique: true },
    purpose: { type: String, required: true },
    disease: { type: [String], default: [] },
    category: { type: String, required: true },
    categories: { type: [String], default: [] },
    sideEffects: { type: String, required: true },
    dosage: { type: [String], required: true },
    contraindications: { type: [String], default: [] },
    interactions: { type: [String], default: [] },
    howItWorks: { type: String, required: true },
    whenToTake: { type: String, required: true },
    warnings: { type: [String], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

MedicationSchema.index({ name: 'text', category: 'text' });

export const Medication = mongoose.model<IMedication>('Medication', MedicationSchema);
