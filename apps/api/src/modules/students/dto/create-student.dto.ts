import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsEmail,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty({ example: 'Tenzin Dorjee' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Grade 11' })
  @IsNotEmpty()
  @IsString()
  grade: string;

  @ApiProperty({ example: 'Namkha Khyung Dzong School' })
  @IsNotEmpty()
  @IsString()
  school: string;

  @ApiProperty({ example: 'Yultsho Dhun' })
  @IsNotEmpty()
  @IsString()
  region: string;

  @ApiPropertyOptional({ enum: ['Active', 'Pending', 'Graduated', 'Inactive'], default: 'Pending' })
  @IsOptional()
  @IsEnum(['Active', 'Pending', 'Graduated', 'Inactive'])
  status?: string;

  @ApiPropertyOptional({
    example: 'http://localhost:3333/uploads/8f14e45f.jpg',
    description: 'Profile photo URL — upload the file via POST /api/upload first',
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({
    example: 'http://localhost:3333/uploads/c9f0f895.png',
    description:
      'Academic certificate image URL — upload the file via POST /api/upload first',
  })
  @IsOptional()
  @IsString()
  certificateImage?: string;

  @ApiPropertyOptional({ example: 'student@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+977 9800000000' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Scholarship recipient since 2023' })
  @IsOptional()
  @IsString()
  notes?: string;
}
