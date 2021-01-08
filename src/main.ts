import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
async function bootstrap() {
  const logger=new Logger("bootstrap")
  const app = await NestFactory.create(AppModule);
  app.use(bodyParser.json({limit: '50mb'}));
  app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit:50000}));
  app.enableCors();
  logger.log("hello")
  await app.listen(process.env.PORT||3000);
}
bootstrap();
