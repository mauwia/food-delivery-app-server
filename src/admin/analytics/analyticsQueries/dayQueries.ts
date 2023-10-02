const now = new Date();
const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).valueOf();
const endOfDay = new Date(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).valueOf() - 1).valueOf();

export const FulfillingFcToday = () => [
  { $match: { 
      timestamp: {
        $gte: startOfDay.toString(),
        $lte: endOfDay.toString(),
      },
      orderStatus: 'Order Completed',
    }
  },
  { $group: {
      _id: "$foodCreatorId",
      fulfillingDayCount: { $sum: 1 },
    }
  }
];

export const ActiveFCToday = () => [
  { $match: { 
    updatedAt: {
      $gte: (new Date(startOfDay)),
      $lte: (new Date(endOfDay)),
    }}
  },
  { $group: {
    _id: "$foodCreatorId",
  }},
];

export const FLOrdersToday = () => [
  {
    $match: {
      updatedAt: {
        $gte: (new Date(startOfDay)),
        $lte: (new Date(endOfDay)),
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
