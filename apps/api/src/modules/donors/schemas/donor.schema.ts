import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DonorDocument = Donor & Document;

@Schema({ collection: 'donors', timestamps: true })
export class Donor {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true, lowercase: true })
  email: string;

  @Prop({ trim: true })
  phone: string;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ default: 'NPR' })
  currency: string;

  @Prop({ required: true, trim: true })
  location: string;

  @Prop({
    enum: ['One-time', 'Monthly', 'Annual'],
    default: 'One-time',
  })
  type: string;

  @Prop({ type: Date, default: Date.now })
  date: Date;

  @Prop({ default: '' })
  avatar: string;

  /** Donor's profile photo URL (returned by POST /api/upload). */
  @Prop({ default: '' })
  profileImage: string;

  @Prop({ trim: true })
  message: string;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const DonorSchema = SchemaFactory.createForClass(Donor);

// Text index for search
DonorSchema.index({ name: 'text', email: 'text', location: 'text' });
