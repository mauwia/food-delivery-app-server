import * as moment from "moment";
import { Model, Types } from "mongoose";

export let WeekQueryAnalytics = (foodCreatorId) => {
  return [
    {
      $match: {
        $and: [
          { foodCreatorId: Types.ObjectId(foodCreatorId) },
          {
            timestamp: {
              $gte: moment().startOf("week").unix().toString(),
              $lte: moment().endOf("week").unix().toString(),
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
        weekRevenue: [
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
export let lastWeekQueryAnalytics = (foodCreatorId) => {
  return [
    {
      $match: {
        $and: [
          { foodCreatorId: Types.ObjectId(foodCreatorId) },
          {
            timestamp: {
              $gte: moment()
                .subtract(1, "week")
                .startOf("week")
                .unix()
                .toString(),
              $lte: moment().subtract(1, "week").endOf("week").unix().toString(),
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
        lastWeekRevenue: [
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
export let lastWeekReviewAnalyticQuery=(foodCreatorId)=>{
  return [
    {
      $match: {
        $and: [
          { foodCreatorId: Types.ObjectId(foodCreatorId) },
          {
            timestamp: {
              $gte: moment()
                .subtract(1, "week")
                .startOf("week")
                .unix()
                .toString(),
              $lte: moment().subtract(1, "week").endOf("week").unix().toString(),
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
export let weekReviewAnalyticQuery=(foodCreatorId)=>{
  return [
    {
      $match: {
        $and: [
          { foodCreatorId: Types.ObjectId(foodCreatorId) },
          {
            timestamp: {
              $gte: moment().startOf("week").unix().toString(),
              $lte: moment().endOf("week").unix().toString(),
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