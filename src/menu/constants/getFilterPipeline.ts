export const filterPipeline= (lng,lat,searchKey,rating)=>{
    return {
        $and: [
          {
            location: {
              $near: {
                $maxDistance: 5000,
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
                    phoneNo:searchKey
                  }
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
                    avgRating: { $gte: rating },
                  },
                ],
              },
            ],
          },
        ],
      }
}