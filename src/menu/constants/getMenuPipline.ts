import { Types } from "mongoose";

export default (req) => {
  return [
    {
      $match: {
        foodCreatorId: new Types.ObjectId(req.params.creatorID),
      },
    },
    {
      $lookup: {
        from: "foodcreators",
        pipeline: [
          {
            $match: {
              _id: new Types.ObjectId(req.params.creatorID),
            },
          },
        ],
        as: "foodCreatorId",
      },
    },

    {
      $lookup: {
        from: "menuitems",
        // localField: "menuItems", // field in the orders collection
        // foreignField: "_id", // field in the items collection
        // let: { foodCreatorId: "$_id" },
        let: { menuItems: "$menuItems" },
        pipeline: [
          {
            $match: {
              $expr: {
                //         $eq: ["$$foodCreatorId", "$foodCreatorId"],
                $in: ["$_id", "$$menuItems"],
              },
            },
          },
        ],
        as: "menuItems",
      },
    },

    { $unwind: "$foodCreatorId" },
    {
      $project: {
        menuName: 1,
        menuItems: 1,
        foodCreatorId: {
          businessName: "$foodCreatorId.businessName",
          _id: "$foodCreatorId._id",
        },
      },
    },
    {
      $lookup: {
        from: "orders",
        localField: "menuItems._id", // field in the orders collection
        foreignField: "orderedFood.menuItemId", // field in the items collection
        as: "orders",
      },
    },
    {
      $project: {
        menuName: 1,
        menuItems: 1,
        foodCreatorId: {
          businessName: "$foodCreatorId.businessName",
          _id: "$foodCreatorId._id",
        },
        orders: {
          $filter: {
            input: "$orders",
            as: "order",
            cond: { $eq: ["$$order.orderStatus", "Order Completed"] },
          },
        },
      },
    },
    {
      $addFields: {
        "menuItems.orderCounts": { $size: "$orders" },
      },
    },
    {
      $unset: "orders",
    },
  ];
};
