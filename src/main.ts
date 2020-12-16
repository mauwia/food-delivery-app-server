import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger=new Logger("bootstrap")
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  logger.log("hello")
  await app.listen(process.env.PORT||3000);
}
bootstrap();
