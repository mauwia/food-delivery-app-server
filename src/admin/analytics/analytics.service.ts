import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OrdersService } from '../orders/orders.service';
import { FoodCreator } from "../../food-creator/food-creator.model";
import { Menu } from "../../menu/menu.model";
import { ActiveFCToday } from '../analytics/analyticsQueries/dayQueries';
import { ActiveFCWeek } from '../analytics/analyticsQueries/weekQueries';
import { ActiveFCMonth } from '../analytics/analyticsQueries/monthQueries';
import { Model } from 'mongoose';

const _uniq = require('lodash/uniq');

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel("FoodLover") private readonly foodLoverModel,
    @InjectModel("Menu") private readonly menuModel: Model<Menu>,
    @InjectModel("FoodCreator") private readonly foodCreatorModel: Model<FoodCreator>,
    private readonly adminOrdersService: OrdersService,
  ) {}

  async getFCUpdatedMenuDaily () {
    return await this.menuModel.aggregate(ActiveFCToday());
  }

  async getFCUpdatedProfileDaily () {
    return await this.foodCreatorModel.aggregate(ActiveFCToday());
  }

  async getFCUpdatedMenuWeek () {
    return await this.menuModel.aggregate(ActiveFCWeek());
  }

  async getFCUpdatedProfileWeek () {
    return await this.foodCreatorModel.aggregate(ActiveFCWeek());
  }

  async getFCUpdatedMenuMonth () {
    return await this.menuModel.aggregate(ActiveFCMonth());
  }

  async getFCUpdatedProfileMonth () {
    return await this.foodCreatorModel.aggregate(ActiveFCMonth());
  }

  async getCreatorsMetrics() {
    const totalCreators = await this.foodCreatorModel.estimatedDocumentCount();
    const verified = await this.foodCreatorModel.countDocuments({ adminVerified: { $in: ['Completed', 'Verified'] }});
    const fulfillingDay = await this.adminOrdersService.getFCsDailyOrdersCount();
    const fulfillingWeek = await this.adminOrdersService.getFCsWeeklyOrdersCount();
    const fulfillingMonth = await this.adminOrdersService.getFCsMonthlyOrdersCount();

    const fcUpdatedMenuDay = await this.getFCUpdatedMenuDaily();
    const fcUpdatedProfileDay = await this.getFCUpdatedProfileDaily();
    const fcProcessedOrderDay = fulfillingDay;
    const activeDayArray = [
      ...fcUpdatedMenuDay,
      ...fcUpdatedProfileDay,
      ...fcProcessedOrderDay].map(item => {
      if (item._id) {
        return "" + item._id;
      }
    });
    const uniqueActiveDayResult = _uniq(activeDayArray);

    const fcUpdatedMenuWeek = await this.getFCUpdatedMenuWeek();
    const fcUpdatedProfileWeek = await this.getFCUpdatedProfileWeek();
    const fcProcessedOrderWeek = fulfillingWeek;
    const activeWeekArray = [
      ...fcUpdatedMenuWeek,
      ...fcUpdatedProfileWeek,
      ...fcProcessedOrderWeek ].map(item => {
      if (item._id) {
        return "" + item._id;
      }
    });;
    const uniqueActiveWeekResult = _uniq(activeWeekArray);

    const fcUpdatedMenuMonth = await this.getFCUpdatedMenuMonth();
    const fcUpdatedProfileMonth = await this.getFCUpdatedProfileMonth();
    const fcProcessedOrderMonth = fulfillingMonth;
    const activeMonthResultArray = [
      ...fcUpdatedMenuMonth,
      ...fcUpdatedProfileMonth,
      ...fcProcessedOrderMonth ].map(item => {
      if (item._id) {
        return "" + item._id;
      }
    });
    const uniqueActiveMonthResult = _uniq(activeMonthResultArray).filter(Boolean);
    
    return {
      // total, verified, fulfilling, active
      total: totalCreators,
      verified,
      fulfilling: {
        today: fulfillingDay.length
          ? fulfillingDay.length
          : 0,
        week: fulfillingWeek.length
          ? fulfillingWeek.length
          : 0,
        month: fulfillingMonth.length
          ? fulfillingMonth.length
          : 0,
      },
      active: {
        today: uniqueActiveDayResult.length,
        week: uniqueActiveWeekResult.length,
        month: uniqueActiveMonthResult.length,
      },
    }
  }

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
