import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StudentDocument = Student & Document;

@Schema({ collection: 'students', timestamps: true })
export class Student {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  grade: string;

  @Prop({ required: true, trim: true })
  school: string;

  @Prop({ required: true, trim: true })
  region: string;

  @Prop({
    enum: ['Active', 'Pending', 'Graduated', 'Inactive'],
    default: 'Pending',
  })
  status: string;

  @Prop({ default: '' })
  avatar: string;

  /** Student's profile photo URL (returned by POST /api/upload). */
  @Prop({ default: '' })
  profileImage: string;

  /** Scanned academic certificate image URL (returned by POST /api/upload). */
  @Prop({ default: '' })
  certificateImage: string;

  @Prop({ trim: true, lowercase: true })
  email: string;

  @Prop({ trim: true })
  phone: string;

  @Prop({ trim: true })
  notes: string;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const StudentSchema = SchemaFactory.createForClass(Student);

// Text index for search
StudentSchema.index({ name: 'text', school: 'text', region: 'text' });
