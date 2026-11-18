import { Schema, model, models } from "mongoose";

export interface IImage {
  filename: string;
  mimetype: string;
  data: Buffer;
  createdAt: Date;
}

const ImageSchema = new Schema<IImage>({
  filename: { type: String, required: true },
  mimetype: { type: String, required: true },
  data:     { type: Buffer,  required: true },
  createdAt:{ type: Date,    default: Date.now },
});

export const ImageModel = models.Image || model<IImage>("Image", ImageSchema);

