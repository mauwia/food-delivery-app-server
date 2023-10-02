export const filterPipelineRating = (lng, lat, searchKey, rating) => {
  return {
    $and: [
      {
        location: {
          $near: {
            $maxDistance: 7000,
            $geometry: {
              type: "Point",
              coordinates: [lng, lat],
            },
          },
        },
      },
      {
        menuExist: true,
      },
      {
        onlineStatus: true,
      },
      {
        whitelistedTester: false,
      },
      {
        $and: [
          {
            $or: [
              {
                businessName: searchKey,
              },
              {
                username: searchKey,
              },
              {
                phoneNo: searchKey,
              },
            ],
          },
          {
            $or: [
              //   {
              //     $and:[
              //       {"creatorFoodType.text":creatorFoodType},
              //       {"creatorFoodType.selected":true}
              //     ]
              //     // creatorFoodType: { $in: [req.body.creatorFoodType] },

              //   },
              {
                adminVerified: "Verified",
              },
              {
                adminVerified: "Completed",
              },
              {
                avgRating: { $gte: rating },
              },
            ],
          },
        ],
      },
    ],
  };
};
export const filterPipelineCategory = (lng, lat, searchKey) => {
  return {
    $and: [
      {
        location: {
          $near: {
            $maxDistance: 7000,
            $geometry: {
              type: "Point",
              coordinates: [lng, lat],
            },
          },
        },
      },
      {
        menuExist: true,
      },
      {
        onlineStatus: true,
      },
      {
        whitelistedTester: false,
      },
      {
        $or: [
          {
            adminVerified: "Verified",
          },
          {
            adminVerified: "Completed",
          },
        ],
      },
      {
        $and: [
          {
            $or: [
              {
                businessName: searchKey,
              },
              {
                username: searchKey,
              },
              {
                phoneNo: searchKey,
              },
            ],
          },
        ],
      },
    ],
  };
};
