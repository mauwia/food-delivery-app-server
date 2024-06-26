const now = new Date();
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).valueOf();
const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).valueOf();



export const FulfillingFcMonth = () => [
  { $match: { 
      timestamp: {
        $gte: startOfMonth.toString(),
        $lte: endOfMonth.toString(),
      },
      orderStatus: 'Order Completed',
    }
  },
  { $group: {
    _id: "$foodCreatorId",
    fulfillingMonthCount: { $sum: 1 },
  }},
];

export const ActiveFCMonth = () => [
  { $match: { 
    updatedAt: {
      $gte: (new Date(startOfMonth)),
      $lte: (new Date(endOfMonth)),
    }}
  },
  { $group: {
    _id: "$foodCreatorId",
  }},
];

export const FLOrdersMonth = () => [
  {
    $match: {
      updatedAt: {
        $gte: (new Date(startOfMonth)),
        $lte: (new Date(endOfMonth)),
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
