import * as mongoose from "mongoose";

export const MenuSchema=new mongoose.Schema({
    foodCreatorId:{type:mongoose.Schema.Types.ObjectId,ref:"FoodCreator"},
    // MenuItems:[{type:mongoose.Schema.Types.ObjectId,ref:"MenuItem"}]
    imageUrls:[{type:String}],
    name:{type:String},
    details:{type:String},
    preparationTime:{type:String},
    price:{type:Number},
    discount:{type:String},
    reviews:[{type:Object}],
    category:{type:String}
})
// export const MenuItemSchema=new mongoose.Schema({
//     imageUrls:[{type:String}],
//     name:{type:String},
//     details:{type:String},
//     preparationTime:{type:String},
//     price:{type:Number},
//     discount:{type:String},
//     Reviews:[{type:Object}],
//     category:{type:String}
// })
export interface Menu extends mongoose.Document{
    foodCreatorId:string;
    imageUrls:string;
    name:string;
    details:string;
    preparationTime:string;
    price:number;
    discount:string;
    reviews:Array<object>;
    category:string
}