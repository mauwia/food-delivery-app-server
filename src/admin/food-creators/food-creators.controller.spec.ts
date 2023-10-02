import { Test, TestingModule } from '@nestjs/testing';
import { FoodCreatorsController } from './food-creators.controller';

describe('FoodCreatorsController', () => {
  let controller: FoodCreatorsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FoodCreatorsController],
    }).compile();

    controller = module.get<FoodCreatorsController>(FoodCreatorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
