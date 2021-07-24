const now = new Date();
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).valueOf();
const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).valueOf();



export const FulfillingFcMonth = () => [
  { $match: { 
      timestamp: {
        $gte: startOfMonth.toString(),
        $lte: endOfMonth.toString(),
      }
    }
  },
  { $count: "fulfillingMonthCount" },
]
