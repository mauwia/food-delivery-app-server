import { Injectable } from '@nestjs/common';
// import{ BncClient, rpc } from "@binance-chain/javascript-sdk";
const { BncClient, rpc } = require("@binance-chain/javascript-sdk");
const rpcclient = new rpc("http://data-seed-pre-2-s1.binance.org:80");
const client = new BncClient(rpcclient);
client.chooseNetwork("testnet");
@Injectable()
export class WalletService {
    async createWallet(){
      // const client = new BncClient("https://bsc-dataseed.binance.org/");
      try{
      const createAccount = await client.createAccount();
      return createAccount
      }catch(e){
        return e
      }​
     }
     async getBalance(publicAddress){
      try{  let balance = await rpcclient.getBalance(
            // "tbnb1fdl8ra8dq69s3wnafl954fcxssxkj994kl68lu",
            // "tbnb1m77y2ckxth0v08n9nrkqj292cp03h980ek69e7",
                publicAddress,
                "BNB"
          );
          console.log("a===>",balance);
          return balance
        }catch(e){
              if(e.message=="Cannot read property 'address' of null")
              return {balance:0}
              return e
          }
     }
}

// (async () => {
//   let a: any 
//   const b = await client.createAccount();
//  try{  a = await rpcclient.getBalance(
//     // "tbnb1fdl8ra8dq69s3wnafl954fcxssxkj994kl68lu",
//     // "tbnb1m77y2ckxth0v08n9nrkqj292cp03h980ek69e7",
//     b.address,
//     "BNB"
//   );
//   console.log("a===>",a);
// }catch(e){
//       if(e.message=="Cannot read property 'address' of null")
//       console.log("Wallet empty")
//   }
//   console.log('b===>',b);
// })();
​
// // Transfer Tokens
// client.transfer(fromAddress, toAddress, amount, asset, memo, sequence);
​
// // Orders
// client.placeOrder(address, symbol, side, price, quantity, sequence);
// client.cancelOrder(fromAddress, symbols, orderIds, refids, sequence);
​
// // Get Account
// client.getAccount(address);