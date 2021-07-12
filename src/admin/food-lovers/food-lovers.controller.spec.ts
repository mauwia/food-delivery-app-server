import { Test, TestingModule } from '@nestjs/testing';
import { FoodLoversController } from './food-lovers.controller';

describe('FoodLoversController', () => {
  let controller: FoodLoversController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FoodLoversController],
    }).compile();

    controller = module.get<FoodLoversController>(FoodLoversController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
