import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { PORT } from './common/constant/app.constant';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // Gọi thêm /api sau url
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Test CI CD')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  // api/docs => Đường dẫn để truy cập
  SwaggerModule.setup('api/docs', app, documentFactory);

  await app.listen(PORT || 3069, () => {
    console.log(`Server running on port at http://localhost:${PORT}`);
  });
}
bootstrap();
