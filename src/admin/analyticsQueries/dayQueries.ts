const now = new Date();
const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).valueOf();
const endOfDay = new Date(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).valueOf() - 1).valueOf();

export const FulfillingFcToday = () => [
  { $match: { 
      timestamp: {
        $gte: startOfDay.toString(),
        $lte: endOfDay.toString(),
      }
    }
  },
  { $group: {
      _id: "$foodCreatorId",
      fulfillingDayCount: { $sum: 1 },
    }
  }
];
