import mongoose, { Schema, Document } from 'mongoose';

export interface IMedication extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  genericName?: string;
  purpose: string;
  disease: string[];
  category: string;
  categories?: string[];
  description?: string;
  dosageForm?: string;
  strength?: string;
  manufacturer?: string;
  sideEffects: string;
  dosage: string[];
  contraindications: string[];
  interactions: string[];
  howItWorks: string;
  whenToTake: string;
  warnings: string[];
  storageInstructions?: string;
  prescriptionRequired?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MedicationSchema = new Schema<IMedication>(
  {
    name: { type: String, required: true, unique: true },
    genericName: { type: String },
    purpose: { type: String, default: '' },
    disease: { type: [String], default: [] },
    category: { type: String, default: 'General' },
    categories: { type: [String], default: [] },
    description: { type: String },
    dosageForm: { type: String },
    strength: { type: String },
    manufacturer: { type: String },
    sideEffects: { type: String, default: '' },
    dosage: { type: [String], default: [] },
    contraindications: { type: [String], default: [] },
    interactions: { type: [String], default: [] },
    howItWorks: { type: String, default: '' },
    whenToTake: { type: String, default: '' },
    warnings: { type: [String], default: [] },
    storageInstructions: { type: String },
    prescriptionRequired: { type: Boolean, default: false },
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
