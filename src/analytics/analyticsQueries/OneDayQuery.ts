import * as moment from "moment";
import { Model, Types } from "mongoose";

export let TodayQueryAnalytics = (foodCreatorId) => {
  return [
    {
      $match: {
        $and: [
          { foodCreatorId: Types.ObjectId(foodCreatorId) },
          {
            timestamp: {
              $gte: moment().startOf("day").unix().toString(),
              $lte: moment().endOf("day").unix().toString(),
            },
          },
        ],
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
        todayRevenue: [
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
export let yesterdayQueryAnalytics = (foodCreatorId) => {
  return [
    {
      $match: {
        $and: [
          { foodCreatorId: Types.ObjectId(foodCreatorId) },
          {
            timestamp: {
              $gte: moment()
                .subtract(1, "days")
                .startOf("day")
                .unix()
                .toString(),
              $lte: moment().subtract(1, "days").endOf("day").unix().toString(),
            },
          },
        ],
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
        yesterdayRevenue: [
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
export let yesterdayReviewAnalyticQuery=(foodCreatorId)=>{
  return [
    {
      $match: {
        $and: [
          { foodCreatorId: Types.ObjectId(foodCreatorId) },
          {
            timestamp: {
              $gte: moment()
                .subtract(1, "days")
                .startOf("day")
                .unix()
                .toString(),
              $lte: moment().subtract(1, "days").endOf("day").unix().toString(),
            },
          },
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
export let todayReviewAnalyticQuery=(foodCreatorId)=>{
  return [
    {
      $match: {
        $and: [
          { foodCreatorId: Types.ObjectId(foodCreatorId) },
          {
            timestamp: {
              $gte: moment().startOf("day").unix().toString(),
              $lte: moment().endOf("day").unix().toString(),
            },
          },
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