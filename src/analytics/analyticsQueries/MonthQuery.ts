import * as moment from "moment";
import { Model, Types } from "mongoose";

export let MonthQueryAnalytics = (foodCreatorId) => {
  return [
    {
      $match: {
        $and: [
          { foodCreatorId: Types.ObjectId(foodCreatorId) },
          {
            timestamp: {
              $gte: moment().startOf("month").unix().toString(),
              $lte: moment().endOf("month").unix().toString(),
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
        monthRevenue: [
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
export let lastMonthQueryAnalytics = (foodCreatorId) => {
  return [
    {
      $match: {
        $and: [
          { foodCreatorId: Types.ObjectId(foodCreatorId) },
          {
            timestamp: {
              $gte: moment()
                .subtract(1, "month")
                .startOf("month")
                .unix()
                .toString(),
              $lte: moment()
                .subtract(1, "month")
                .endOf("month")
                .unix()
                .toString(),
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
        lastMonthRevenue: [
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
export let lastMonthReviewAnalyticQuery=(foodCreatorId)=>{
  return [
    {
      $match: {
        $and: [
          { foodCreatorId: Types.ObjectId(foodCreatorId) },
          {
            timestamp: {
              $gte: moment()
                .subtract(1, "month")
                .startOf("month")
                .unix()
                .toString(),
              $lte: moment().subtract(1, "month").endOf("month").unix().toString(),
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
export let monthReviewAnalyticQuery=(foodCreatorId)=>{
  return [
    {
      $match: {
        $and: [
          { foodCreatorId: Types.ObjectId(foodCreatorId) },
          {
            timestamp: {
              $gte: moment().startOf("month").unix().toString(),
              $lte: moment().endOf("month").unix().toString(),
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