import { ServerRespond } from './DataStreamer';

export interface Row {
  price_abc: number,   // The average price of stock ABC calculated from the top ask and bid prices
  price_def: number;   // The average price of stock DEF calculated from the top ask and bid prices
  ratio: number;       // The ratio of price_abc to price_def, used for comparison and alerting
  timestamp: Date;     // The latest timestamp from the server responses, representing the most recent data
  upper_bound: number;  // The upper bound for the ratio, calculated as +10% of the 12-month historical average ratio
  lower_bound: number;  // The lower bound for the ratio, calculated as -10% of the 12-month historical average ratio
  trigger_alert:number | undefined, // The ratio value that triggers an alert if it is outside the upper or lower bounds; undefined if within bounds

}


export class DataManipulator {
  static generateRow(serverRespond: ServerRespond[]): Row {
    const priceABC = (serverRespond[0]. top_ask.price + serverRespond[0]. top_bid.price) / 2;
    const priceDEF = (serverRespond[1]. top_ask.price + serverRespond[1]. top_bid.price) / 2;
    const ratio = priceABC / priceDEF;
    const upperBound = 1.10; // +10% of historical average
    const lowerBound = 0.90; // -10% of historical average
      return {
        price_abc: priceABC,
        price_def: priceDEF,
        ratio,
        timestamp: serverRespond[0]. timestamp > serverRespond[1]. timestamp ?
         serverRespond[0]. timestamp : serverRespond[1]. timestamp,
        upper_bound: upperBound,
        lower_bound: lowerBound,
        trigger_alert: (ratio > upperBound || ratio < lowerBound) ? ratio : undefined,
      }; 
    
  }
}
