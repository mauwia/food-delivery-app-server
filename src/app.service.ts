import { Injectable } from '@nestjs/common';
import { pad } from './utils';

@Injectable()
export class AppService {
  uniqueNumber='19000050'
  getHello(): string {
    return 'Hello World!';
  }
  getUniqueNumber(){
    let incrementOrder= +this.uniqueNumber+1
    // console.log(incrementOrder)
    this.uniqueNumber= pad(incrementOrder,this.uniqueNumber.length)
    return {uniqueNumber:this.uniqueNumber}
  }
}
