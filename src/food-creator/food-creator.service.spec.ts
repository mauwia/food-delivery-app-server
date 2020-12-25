import { Test, TestingModule } from '@nestjs/testing';
import { FoodCreatorService } from './food-creator.service';

describe('FoodCreatorService', () => {
  let service: FoodCreatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FoodCreatorService],
    }).compile();

    service = module.get<FoodCreatorService>(FoodCreatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
