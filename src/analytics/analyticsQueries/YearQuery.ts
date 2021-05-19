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
