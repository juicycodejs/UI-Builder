import mongoose from 'mongoose';

export interface IDocument {
  projectId: string;
  snapshot: string; // base64-encoded Y.js state
  updatedAt: Date;
}

const documentSchema = new mongoose.Schema<IDocument>({
  projectId: { type: String, required: true, unique: true, index: true },
  snapshot: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
});

export const DocumentModel = mongoose.model<IDocument>('Document', documentSchema);
