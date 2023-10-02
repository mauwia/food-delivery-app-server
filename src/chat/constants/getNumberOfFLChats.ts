

export default (client)=>{
    return [
        {
          $match: {
            phoneNo: client.handshake.query.userNo,
          },
        },
        {
          $project: {
            phoneNo: "$phoneNo",
          },
        },
        {
          $lookup: {
            from: "chatrooms",
            localField: "_id",
            foreignField: "foodLoverId",
            as: "Chats",
          },
        },
        {
          $lookup: {
            from: "foodcreators",
            localField: "Chats.foodCreatorId",
            foreignField: "_id",
            as: "phoneNo",
          },
        },
        {
          $project: {
            phoneNo: "$phoneNo.phoneNo",
          },
        },
      ]
}