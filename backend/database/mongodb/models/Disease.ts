import mongoose, { Schema, Document } from 'mongoose';

export interface IDisease extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  category: string;
  categories?: string[];
  severity: string;
  definition: string;
  symptoms: string[];
  causes: string[];
  testsAndProcedures: string[];
  medications: string[];
  treatments: string[];
  prevention: string[];
  prognosis: string;
  prevalence: string;
  createdAt: Date;
  updatedAt: Date;
}

const DiseaseSchema = new Schema<IDisease>(
  {
    name: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    categories: { type: [String], default: [] },
    severity: { type: String, required: true },
    definition: { type: String, required: true },
    symptoms: { type: [String], required: true },
    causes: { type: [String], required: true },
    testsAndProcedures: { type: [String], required: true },
    medications: { type: [String], default: [] },
    treatments: { type: [String], default: [] },
    prevention: { type: [String], required: true },
    prognosis: { type: String, required: true },
    prevalence: { type: String, required: true },
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

DiseaseSchema.index({ name: 'text', category: 'text' });

export const Disease = mongoose.model<IDisease>('Disease', DiseaseSchema);
