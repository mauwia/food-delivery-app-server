const { profileTestData } = require('./profileTestData');

const { foodLover, foodCreator, updatedFoodLover } = profileTestData;

class FoodCreatorModel {
  constructor() {}
  static save = jest.fn().mockResolvedValue(foodCreator);
  static find = jest.fn().mockResolvedValue([foodCreator, foodCreator]);
  static findOne = jest.fn().mockImplementation((body) => {
    if (body.phoneNo === foodCreator.phoneNo) {
      return Promise.resolve(foodCreator);
    }
  });
  static findOneAndUpdate = jest.fn().mockResolvedValue(foodCreator);
}

class FoodLoverModel {
  constructor() {}
  static save = jest.fn().mockResolvedValue(foodLover);
  static find = jest.fn().mockResolvedValue([foodLover, foodLover]);
  static findOne = jest.fn().mockImplementation((body) => {
    if (body.phoneNo === foodLover.phoneNo) {
      return Promise.resolve(foodLover);
    }
  });
  static findOneAndUpdate = jest.fn().mockResolvedValue(updatedFoodLover);
}

module.exports = {
  FoodCreatorModel,
  FoodLoverModel,
}
