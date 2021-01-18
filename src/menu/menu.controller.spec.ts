import { Test, TestingModule } from '@nestjs/testing';
import { MenuController } from './menu.controller';
import { getModelToken } from "@nestjs/mongoose";
import { Request } from "express";

describe('MenuController', () => {
  let controller: MenuController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuController],
    }).compile();

    controller = module.get<MenuController>(MenuController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
