import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Widget' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'A useful widget', required: false })
  @IsString()
  description?: string;

  @ApiProperty({ example: 19.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  stock: number;
}
