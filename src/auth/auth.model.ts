import * as mongoose from 'mongoose';

export const AuthSchema= new mongoose.Schema({
    phoneNo: {type:String,required:true,unique:true},
    passHash: {type:String,required:true},
    location:{type:Array},
    imageUrl:{type:String},
    username:{type:String},
    mobileRegisteredId:{type:String,required:true}
})


export interface Auth {
    
        phoneNo: string;
        passHash: string; 
        location:[];
        imageUrl:string,
        username:string,
        mobileRegisteredId:string;
        
}