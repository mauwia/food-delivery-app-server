const now = new Date();
const day = now.getDay();
const startOfWeek = new Date(now.getTime() - 60*60*24* day*1000); // will return firstday (i.e. Sunday) of the week
const endOfWeek = new Date(startOfWeek.getTime() + 60 * 60 *24 * 6 * 1000); // adding (60*60*6*24*1000) means adding six days to the firstday which results in lastday (Saturday) of the week

export const FulfillingFcWeek = () => [
  { $match: { 
      timestamp: {
        $gte: startOfWeek.valueOf().toString(),
        $lte: endOfWeek.valueOf().toString(),
      },
      orderStatus: 'Order Completed',
    }
  },
  { $group: {
      _id: "$foodCreatorId",
      fulfillingWeekCount: { $sum: 1 },
    }
  },
];

export const ActiveFCWeek = () => [
  { $match: { 
    updatedAt: {
      $gte: (new Date(startOfWeek)),
      $lte: (new Date(endOfWeek)),
    }}
  },
  { $group: {
    _id: "$foodCreatorId",
  }},
];

export const FLOrdersWeek = () => [
  {
    $match: {
      updatedAt: {
        $gte: (new Date(startOfWeek)),
        $lte: (new Date(endOfWeek)),
      },
    },
  },
  {
    $facet: {
      placedUncompletedOrder: [
        {
          $match: {
            orderStatus: {
              $ne: "Order Completed",
            },
          },
        },
        {
          $group: {
            _id: "$foodLoverId",
          },
        },
      ],
      placedCompletedOrder: [
        {
          $match: {
            orderStatus: {
              $eq: "Order Completed",
            },
          },
        },
        {
          $group: {
            _id: "$foodLoverId",
          },
        },
      ],
      reviewedAnOrder: [
        {
          $match: {
            orderReviewed: {
              $eq: true,
            },
          },
        },
        {
          $group: {
            _id: "$foodLoverId",
          },
        },
      ],
    },
  },
];
