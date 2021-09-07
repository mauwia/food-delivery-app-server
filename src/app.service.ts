import { Injectable } from '@nestjs/common';
import { pad,bnbToNosh } from './utils';

@Injectable()
export class AppService {
  uniqueNumber='20000000'
  getHello(): string {
    return 'Hello Noshify Production';
  }
  getUniqueNumber = async ()=>{
    await bnbToNosh()
    // let incrementOrder= +this.uniqueNumber+1
    // // console.log(incrementOrder)
    // this.uniqueNumber= pad(incrementOrder,this.uniqueNumber.length)
    let date=Date.now()
    return {uniqueNumber:date.toString().substr(4)}
  }
}
