import { Test, TestingModule } from '@nestjs/testing';
import { LandingPageController } from './landing-page.controller';

describe('LandingPageController', () => {
  let controller: LandingPageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LandingPageController],
    }).compile();

    controller = module.get<LandingPageController>(LandingPageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
