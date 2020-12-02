import * as mongoose from 'mongoose';

export const AuthSchema= new mongoose.Schema({
    phone_no: {type:String,required:true,unique:true},
    pass_hash: {type:String,required:true},
    location:{type:Array},
    image_url:{type:String},
    username:{type:String},
    mobile_registered_id:{type:String,required:true,unique:true}
})


export interface Auth {
    
        phone_no: string;
        pass_hash: string; 
        location:[];
        image_url:string,
        username:string,
        mobile_registered_id:string;
        
}