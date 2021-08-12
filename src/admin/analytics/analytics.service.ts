import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OrdersService } from '../orders/orders.service';

const _uniq = require('lodash/uniq');

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel("FoodLover") private readonly foodLoverModel,
    private readonly adminOrdersService: OrdersService,
  ) {}

  async getLoversMetrics() {
    const totalFoodLovers = await this.foodLoverModel.estimatedDocumentCount();
    const dailyOrdersStats = await this.adminOrdersService.getFLsDailyOrdersStats();
    const weeklyOrdersStats = await this.adminOrdersService.getFLsWeeklyOrdersStats();
    const monthlyOrdersStats = await this.adminOrdersService.getFLsMonthlyOrdersStats();

    const transactingFLsDaily = dailyOrdersStats[0].placedCompletedOrder;
    const transactingFLsWeekly = weeklyOrdersStats[0].placedCompletedOrder;
    const transactingFLsMonthly = monthlyOrdersStats[0].placedCompletedOrder;

    const engagingFLsDay = [
      ...dailyOrdersStats[0].reviewedAnOrder,
      ...dailyOrdersStats[0].placedUncompletedOrder,
    ] .map(item => {
        if (item._id) {
          return "" + item._id;
        }
      });
    const uniqueEngagingDayResult = _uniq(engagingFLsDay).filter(Boolean);

    const engagingFLsWeek = [
      ...weeklyOrdersStats[0].reviewedAnOrder,
      ...weeklyOrdersStats[0].placedUncompletedOrder,
    ].map(item => {
        if (item._id) {
          return "" + item._id;
        }
      });
    const uniqueEngagingWeekResult = _uniq(engagingFLsWeek).filter(Boolean);
    
    const engagingFLsMonth = [
      ...monthlyOrdersStats[0].reviewedAnOrder,
      ...monthlyOrdersStats[0].placedUncompletedOrder,
    ].map(item => {
        if (item._id) {
          return "" + item._id;
        }
      });
    const uniqueEngagingMonthResult = _uniq(engagingFLsMonth).filter(Boolean);
    

    return {
      // total, transacting, engaging, active
      total: totalFoodLovers,
      transacting: {
        today: transactingFLsDaily.length,
        week: transactingFLsWeekly.length,
        month: transactingFLsMonthly.length,
      },
      engaging: {
        day: uniqueEngagingDayResult.length,
        week: uniqueEngagingWeekResult.length,
        month: uniqueEngagingMonthResult.length
      },
    }
  }
}
