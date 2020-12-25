import { Test, TestingModule } from '@nestjs/testing';
import { FoodCreatorController } from './food-creator.controller';

describe('FoodCreatorController', () => {
  let controller: FoodCreatorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FoodCreatorController],
    }).compile();

    controller = module.get<FoodCreatorController>(FoodCreatorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
