import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from "@nestjs/mongoose";
import { Request, Response } from "express";
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { BadRequestException } from '@nestjs/common';
import { PROFILE_MESSAGES } from './constants/key-constants';

const bcrypt = require('bcryptjs');
const { FoodCreatorModel, FoodLoverModel } = require('../../test/test-data/modelMocks');
const { profileTestData } = require('../../test/test-data/profileTestData');
const { foodLover, updatedFoodLover } = profileTestData;


describe('ProfileController', () => {
  let profileController: ProfileController;
  let profileService: ProfileService;
  let bcryptHashSync: jest.Mock;

  beforeEach(async () => {
    bcryptHashSync = jest.fn().mockReturnValue('fghuiop-09876t67890oiuygfghj');
    (bcrypt.hashSync as jest.Mock) = bcryptHashSync;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        ProfileService,
        {
          provide: getModelToken("FoodCreator"),
          useValue: FoodCreatorModel,
        },
        {
          provide: getModelToken("FoodLover"),
          useValue: FoodLoverModel,
        },
      ]
    }).compile();

    profileController = module.get<ProfileController>(ProfileController);
    profileService = module.get<ProfileService>(ProfileService)
  });

  describe('/updateProfile endpoint', () => {
    it('should return an error if invalid user type is provided in query string for profile update', async () => {
      let req = (profileTestData.updateProfilePayload as unknown) as Request;
  
      try {
        await profileController.updateProfile(req, profileTestData.invalidQuery);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe(PROFILE_MESSAGES.INVALID_USER_TYPE);
      }
    });
  
    it('should return an error if no user type is provided in query string for profile update', async () => {
      let req = (profileTestData.updateProfilePayload as unknown) as Request;
  
      try {
        await profileController.updateProfile(req, profileTestData.emptyQuery);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe(PROFILE_MESSAGES.SPECIFY_USER_TYPE);
      }
    });
  
    it('should call updateProfile service method with correct parameters', async () => {
      let req = (profileTestData.updateProfilePayload as unknown) as Request;
  
      const param1 = {
        "phoneNo": `${foodLover.phoneNo}`
      };
      const param2 = {
        "$set": {
          "imageUrl": `${foodLover.imageUrl}`,
          "location": foodLover.location,
          "mobileRegisteredId": `${foodLover.mobileRegisteredId}`,
          "phoneNo": `${req.body.phoneNo}`,
          "pinHash": foodLover.pinHash,
          "username": `${req.body.username}`,
          "verified": foodLover.verified
        },
      };
      const param3 = {
        "fields": {"__v": 0, "passHash": 0},
        "new": true
      };
  
      const FLfindOneAndUpdateSpy = jest
        .spyOn(FoodLoverModel, 'findOneAndUpdate')
        .mockResolvedValue(updatedFoodLover);
      const response = await profileController.updateProfile(req, profileTestData.flQuery);
  
      expect(FLfindOneAndUpdateSpy).toHaveBeenCalledTimes(1);
      expect(FLfindOneAndUpdateSpy).toHaveBeenCalledWith(param1, param2, param3);
      expect(response).toEqual(updatedFoodLover);
    });
  });
  describe('/updatePassword endpoint', () => {
    it('should return an error if user profile does not exist', async () => {
      const req = ({
        body: {
          password: 'testpassword',
        },
        user: {
          phoneNo: '456789'
        }
      } as unknown) as Request;

      try {
        await profileController.updatePassword(req, profileTestData.flQuery);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe(PROFILE_MESSAGES.USER_NOT_FOUND);
      }
    });

    it('should successfully call updatePassword service method with correct parameters', async () => {
      const req = ({
        body: {
          password: 'testpassword',
        },
        user: {
          phoneNo: '123456789'
        }
      } as unknown) as Request;

      const response = await profileController.updatePassword(req, profileTestData.flQuery);
      expect(response.passwordUpdated).toEqual(true);
    });
  });
});
