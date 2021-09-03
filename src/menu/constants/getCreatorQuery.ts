import { Model, Types } from "mongoose";
export const getNonSubsCreatorWhitelisted=(lng,lat,UserInfo)=>{
    return{
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
            whitelistedTester: true,
          },
          {
            onlineStatus: true,
          },
          {
            subscribers: { $nin: [Types.ObjectId(UserInfo._id)] },
          },
        ],
        $or: [
          {
            adminVerified: "Verified",
          },
          {
            adminVerified: "Completed",
          },
        ],
      }
}
export const getNonSubsCreator=(lng,lat,UserInfo)=>{
    return{
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
            whitelistedTester: false,
          },
          {
            onlineStatus: true,
          },
          {
            subscribers: { $nin: [Types.ObjectId(UserInfo._id)] },
          },
        ],
        $or: [
          {
            adminVerified: "Verified",
          },
          {
            adminVerified: "Completed",
          },
        ],
      }
}
export const getSubsCreator=(lng,lat,UserInfo)=>{
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
            whitelistedTester: false,
          },
          {
            subscribers: { $in: [Types.ObjectId(UserInfo._id)] },
          },
          {
            onlineStatus: true,
          },
        ],
        $or: [
          {
            adminVerified: "Verified",
          },
          {
            adminVerified: "Completed",
          },
        ],
      }
}
export const getSubsCreatorWhiteListed=(lng,lat,UserInfo)=>{
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
            whitelistedTester: true,
          },
          {
            subscribers: { $in: [Types.ObjectId(UserInfo._id)] },
          },
          {
            onlineStatus: true,
          },
        ],
        $or: [
          {
            adminVerified: "Verified",
          },
          {
            adminVerified: "Completed",
          },
        ],
      }
}