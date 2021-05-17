import * as moment from "moment";
import { Model, Types } from "mongoose";

export let WeekQueryAnalytics = (foodCreatorId) => {
  return [
    {
      $match: {
        $and: [
          { foodCreatorId: Types.ObjectId("609a386c8b5ba300214d2ac6") },
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
          { foodCreatorId: Types.ObjectId("609a386c8b5ba300214d2ac6") },
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
