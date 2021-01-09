import * as mongoose from 'mongoose'
export const OrdersSchema = new mongoose.Schema({
    foodLoverId:{type:mongoose.Schema.Types.ObjectId,ref:"FoodLover"},
    foodCreatorId:{type:mongoose.Schema.Types.ObjectId,ref:"FoodCreator"},
    foodDeliveryId:mongoose.Schema.Types.ObjectId,
    orderStatus:{
        type:String,
        enum:["New","Accepted","Being Prepared","Prepared","InTransit","Decline"],
        required:true
    },
    orderId:{type:String},
    locationTo:{address:{type:String}},
    locationFrom:{address:{type:String}},
    orderBill:{type:Number},
    approxGivenTime:{type: String, default: Date.now()},
    timeTaken:{type: String, default: Date.now()},
    promoCode:{type:String},
    deliveryCharges:{type:Number},
    timestamp:{type:String,default:Date.now()},
    // chatRoom
    orderedFood:{type:Object}
});
export interface Orders extends mongoose.Document{
    foodCreatorId:string;
    foodLoverId:string;
    foodDeliveryId:string;
    orderStatus:string;
    timestamp:string;
    locationTo:string;
    orderId:string;
    locationFrom:string;
    orderBill:number;
    promoCode:string;
    deliveryCharges:number;
}