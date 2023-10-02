import * as moment from "moment";
import { Model, Types } from "mongoose";

export let AllTimeQueryAnalytics = (foodCreatorId) => {
  return [
    {
      $match: {
        $and: [{ foodCreatorId: Types.ObjectId(foodCreatorId) }],
      },
    },
    {
      $facet: {
        orderCompleteCounts: [
          {
            $match: {
              orderStatus: {
                $eq: "Order Completed",
              },
            },
          },
          { $count: "completedCount" },
        ],
        orderDeclineCounts: [
          {
            $match: {
              orderStatus: {
                $eq: "Decline",
              },
            },
          },
          { $count: "declineCount" },
        ],
        orderCancelCounts: [
          {
            $match: {
              orderStatus: {
                $eq: "Cancel",
              },
            },
          },
          { $count: "cancelCount" },
        ],
        allTimeRevenue: [
          {
            $match: {
              orderStatus: {
                $eq: "Order Completed",
              },
            },
          },

          {
            $group: {
              _id: "$foodCreatorId",
              totalBill: { $sum: "$realOrderBill" },
            },
          },
        ],
      },
    },
  ];
};
export let allTimeReviewAnalyticQuery=(foodCreatorId)=>{
  return [
    {
      $match: {
        $and: [
          { foodCreatorId: Types.ObjectId(foodCreatorId) },
        ],
      },
    },{
      $facet:{
        total5Stars:[
          {
            $match: {
              rating: {
                $eq: 5,
              },
            },
          },
          { $count: "fiveStars" },
        ],
        total4Stars:[
          {
            $match: {
              rating: {
                $eq: 4,
              },
            },
          },
          { $count: "fourStars" },
        ],
        total3Stars:[
          {
            $match: {
              rating: {
                $eq: 3,
              },
            },
          },
          { $count: "threeStars" },
        ],
        total2Stars:[
          {
            $match: {
              rating: {
                $eq: 2,
              },
            },
          },
          { $count: "twoStars" },
        ],
        total1Stars:[
          {
            $match: {
              rating: {
                $eq: 1,
              },
            },
          },
          { $count: "oneStar" },
        ]
      }
    }
  ]
}
