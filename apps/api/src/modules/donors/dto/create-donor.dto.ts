import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsEmail,
  IsNumber,
  IsPositive,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateDonorDto {
  @ApiProperty({ example: 'Tsering Ngetup Lama' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'donor@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+977 9800000000' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 25000 })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  amount: number;

  @ApiPropertyOptional({ example: 'NPR', default: 'NPR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: 'Kathmandu, Nepal' })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiPropertyOptional({ enum: ['One-time', 'Monthly', 'Annual'], default: 'One-time' })
  @IsOptional()
  @IsEnum(['One-time', 'Monthly', 'Annual'])
  type?: string;

  @ApiPropertyOptional({ example: '2025-01-15' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    example: 'http://localhost:3333/uploads/8f14e45f.jpg',
    description: 'Profile photo URL — upload the file via POST /api/upload first',
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ example: 'Supporting education and preserving our cultural heritage.' })
  @IsOptional()
  @IsString()
  message?: string;
}
