import * as moment from "moment";
import { Model, Types } from "mongoose";

export let yearQueryAnalytics = (foodCreatorId) => {
  return [
    {
      $match: {
        $and: [
          { foodCreatorId: Types.ObjectId(foodCreatorId) },
          {
            timestamp: {
              $gte: moment().startOf("year").unix().toString(),
              $lte: moment().endOf("year").unix().toString(),
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
        yearRevenue: [
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
export let lastYearQueryAnalytics = (foodCreatorId) => {
  return [
    {
      $match: {
        $and: [
          { foodCreatorId: Types.ObjectId(foodCreatorId) },
          {
            timestamp: {
              $gte: moment()
                .subtract(1, "year")
                .startOf("year")
                .unix()
                .toString(),
              $lte: moment().subtract(1, "year").endOf("year").unix().toString(),
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
        lastYearRevenue: [
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
export let lastYearReviewAnalyticQuery=(foodCreatorId)=>{
  return [
    {
      $match: {
        $and: [
          { foodCreatorId: Types.ObjectId(foodCreatorId) },
          {
            timestamp: {
              $gte: moment()
                .subtract(1, "year")
                .startOf("year")
                .unix()
                .toString(),
              $lte: moment().subtract(1, "year").endOf("year").unix().toString(),
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
export let yearReviewAnalyticQuery=(foodCreatorId)=>{
  return [
    {
      $match: {
        $and: [
          { foodCreatorId: Types.ObjectId(foodCreatorId) },
          {
            timestamp: {
              $gte: moment().startOf("year").unix().toString(),
              $lte: moment().endOf("year").unix().toString(),
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
export let revenuePerYearQuery=(foodCreatorId)=>{
  return [
    {
      $match: {
        $and: [
          { foodCreatorId: Types.ObjectId(foodCreatorId) },
          { orderStatus: "Order Completed" },
          {
            timestamp: {
              $gte: moment().startOf("year").unix().toString(),
              $lte: moment().endOf("year").unix().toString(),
            },
          },
        ],
      },
    },
    {
      $project: {
        month: {
          $month: {
            date: { $toDate: { $toLong: "$timestamp" } },
            timezone: "$timezone",
          },
        },
        realOrderBill: 1,
      },
    },
    {
      $group: {
        _id: { month: "$month" },
        total: { $sum: "$realOrderBill" },
        // hour:"$hour"
      },
    },
  ]
}