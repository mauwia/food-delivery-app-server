import * as mongoose from "mongoose";

export const MenuSchema=new mongoose.Schema({
    foodCreatorId:{type:mongoose.Schema.Types.ObjectId,ref:"FoodCreator"},
    menuItems:[{type:mongoose.Schema.Types.ObjectId,ref:"MenuItem"}],
    menuName:{type:String}
    // imageUrls:[{type:String}],
    // name:{type:String},
    // details:{type:String},
    // preparationTime:{type:String},
    // price:{type:Number},
    // discount:{type:String},
    // reviews:[{type:Object}],
    // category:{type:String}
})
export const MenuItemSchema=new mongoose.Schema({
    imageUrls:[{type:String}],
    name:{type:String},
    details:{type:String},
    preparationTime:{type:String},
    price:{type:Number},
    discount:{type:String},
    Reviews:[{type:Object}],
})
export interface Menu extends mongoose.Document{
    foodCreatorId:string;
    menuName:string;
    menuItems:Array<String>
   
}
export interface MenuItems extends mongoose.Document{
    imageUrls:Array<string>;
    name:string;
    details:string;
    preparationTime:string;
    price:number;
    discount:string;
    reviews:Array<object>;
}