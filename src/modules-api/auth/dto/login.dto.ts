import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

// Tạo class để làm type. Hoàn toàn có thể sử dụng type và interface như TS bình thường
export class loginDto {
  // Sử dụng decorator của swagger đều bắt đầu bằng chữ Api
  // ApiProperty này sẽ lấy email mang vào swagger
  @ApiProperty({ example: 'example@gmail.com' })
  // Sử dụng ValidationPipe của Nest
  @IsNotEmpty() // Chỉ cần để decorator ở đây là nó tự kiểm tra email không được null
  @IsEmail({}, { message: 'Invalid email' }) // Validate có phải là dạng email không
  email!: string;

  @ApiProperty({ example: 'Example@123' })
  @IsNotEmpty() // Chỉ cần để decorator ở đây là nó tự kiểm tra password không null
  password!: string;

  @ApiProperty({ example: 123456 })
  @IsOptional()
  @IsString()
  token!: string;
}
