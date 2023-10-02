const profileTestData = {
  foodLover: {
    phoneNo: "123456789",
    passHash: "",
    verified: false,
    pinHash:false,
    location: [],
    imageUrl: "",
    username: "",
    mobileRegisteredId: "12345678",
    save: jest.fn().mockResolvedValue('Save method called'),
  },
  foodCreator: {
    phoneNo: "123456789",
    passHash: "",
    verified: false,
    pinHash:false,
    location: [],
    imageUrl: "",
    businessname: "",
    mobileRegisteredId: "12345678",
    save: jest.fn().mockResolvedValue('Save method called'),
  },
  updatedFoodLover: {
    phoneNo: "+2348098055736",
    passHash: false,
    verified: false,
    pinHash:false,
    location: [],
    imageUrl: "",
    username: "testUser",
    mobileRegisteredId: "12345678",
  },
  updateProfilePayload: {
    body: {
      phoneNo: '+2348098055736',
      username: 'testUser'
    },
    user: {
      phoneNo: '123456789'
    }
  },
  flQuery: {
    user: 'fl'
  },
  fcQuery: {
    user: 'fc'
  },
  invalidQuery: {
    user: 'foo'
  },
  emptyQuery: {
    user: ''
  },
};

module.exports = { profileTestData };
