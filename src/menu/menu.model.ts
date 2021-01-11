import * as mongoose from "mongoose";

export const MenuSchema=new mongoose.Schema({
    foodCreatorId:{type:mongoose.Schema.Types.ObjectId,ref:"FoodCreator"},
    menuItems:[{type:mongoose.Schema.Types.ObjectId,ref:"MenuItems"}],
    menuName:{type:String}
    
})
export const MenuItemSchema=new mongoose.Schema({
    imageUrls:[{type:String}],
    itemName:{type:String},
    description:{type:String},
    preparationTime:{type:String},
    price:{type:Number},
    discount:{type:String},
    reviews:[{type:Object}],
})
export interface Menu extends mongoose.Document{
    foodCreatorId:string;
    menuName:string;
    menuItems:Array<String>
   
}
export interface MenuItems extends mongoose.Document{
    imageUrls:Array<string>;
    itemName:string;
    description:string;
    preparationTime:string;
    price:number;
    discount:string;
    reviews:Array<object>;
}