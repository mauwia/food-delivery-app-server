import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as admin from 'firebase-admin';
import { ServiceAccount } from "firebase-admin";
import * as bodyParser from 'body-parser';
async function bootstrap() {
  const logger=new Logger("bootstrap")
  const app = await NestFactory.create(AppModule);
  app.use(bodyParser.json({limit: '50mb'}));
  app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit:50000}));
  const adminConfig: ServiceAccount = {
    "projectId": process.env.FIREBASE_PROJECT_ID, //Your Firebase Project Id
    "privateKey": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Your firebase private key
    "clientEmail": process.env.FIREBASE_CLIENT_EMAIL, //Your Firebase client email 
  };
  admin.initializeApp({
    credential: admin.credential.cert(adminConfig),
    databaseURL: process.env.FIREBASE_DATABASE_URL, // fire base data url ID  
  });
  app.enableCors();
  logger.log("hello")
  await app.listen(process.env.PORT||3001);
}
bootstrap();
