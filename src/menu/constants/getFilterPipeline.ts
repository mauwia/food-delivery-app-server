export const filterPipelineRating= (lng,lat,searchKey,rating)=>{
    return {
        $and: [
          {
            location: {
              $near: {
                $maxDistance: 30000,
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
export const filterPipelineCategory= (lng,lat,searchKey)=>{
  return {
      $and: [
        {
          location: {
            $near: {
              $maxDistance: 30000,
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
          ],
        },
      ],
    }
}