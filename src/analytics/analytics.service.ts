import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Orders } from "src/orders/orders.model";
import * as moment from "moment";
import {
  TodayQueryAnalytics,
  yesterdayQueryAnalytics,
} from "./analyticsQueries/OneDayQuery";
import {
  MonthQueryAnalytics,
  lastMonthQueryAnalytics,
} from "./analyticsQueries/MonthQuery";
import {
  lastWeekQueryAnalytics,
  WeekQueryAnalytics,
} from "./analyticsQueries/WeekQuery";
import {
  lastYearQueryAnalytics,
  yearQueryAnalytics,
} from "./analyticsQueries/YearQuery";
import { AllTimeQueryAnalytics } from "./analyticsQueries/AllTimeQuery";
import { FoodCreator } from "src/food-creator/food-creator.model";
@Injectable()
export class AnalyticsService {
  private logger = new Logger("Food Lover");
  constructor(
    @InjectModel("Orders") private readonly ordersModel: Model<Orders>,
    @InjectModel("FoodCreator")
    private readonly foodCreatorModel: Model<FoodCreator>
  ) {}
  async getAnalyticsOfToday(req) {
    try {
      let { user } = req;
      const UserInfo = await this.foodCreatorModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw "User not found";
      }
      let todayAnalytics = await this.ordersModel.aggregate(
        TodayQueryAnalytics(UserInfo._id)
      );
      let yesterdayAnalytics = await this.ordersModel.aggregate(
        yesterdayQueryAnalytics(UserInfo._id)
      );
      let analytics = {
        revenue: {
          today: todayAnalytics[0].todayRevenue.length
            ? todayAnalytics[0].todayRevenue[0].totalBill
            : 0,
          yesterday: yesterdayAnalytics[0].yesterdayRevenue.length
            ? yesterdayAnalytics[0].yesterdayRevenue[0].totalBill
            : 0,
        },
        ordersCompleted: {
          today: todayAnalytics[0].orderCompleteCounts.length
            ? todayAnalytics[0].orderCompleteCounts[0].completedCount
            : 0,
          yesterday: yesterdayAnalytics[0].orderCompleteCounts.length
            ? yesterdayAnalytics[0].orderCompleteCounts[0].completedCount
            : 0,
        },
        ordersDecline: {
          today: todayAnalytics[0].orderDeclineCounts.length
            ? todayAnalytics[0].orderDeclineCounts[0].declineCount
            : 0,
          yesterday: yesterdayAnalytics[0].orderDeclineCounts.length
            ? yesterdayAnalytics[0].orderDeclineCounts[0].declineCount
            : 0,
        },
        ordersCancel: {
          today: todayAnalytics[0].orderCancelCounts.length
            ? todayAnalytics[0].orderCancelCounts[0].cancelCount
            : 0,
          yesterday: yesterdayAnalytics[0].orderCancelCounts.length
            ? yesterdayAnalytics[0].orderCancelCounts[0].cancelCount
            : 0,
        },
      };

      return { analytics };
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          msg: error,
        },
        HttpStatus.UNAUTHORIZED
      );
    }
  }
  async getAnalyticsOfMonth(req) {
    try {
      let { user } = req;
      const UserInfo = await this.foodCreatorModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw "User not found";
      }
      let monthAnalytics = await this.ordersModel.aggregate(
        MonthQueryAnalytics(UserInfo._id)
      );
      let lastMonthAnalytics = await this.ordersModel.aggregate(
        lastMonthQueryAnalytics(UserInfo._id)
      );
      let analytics = {
        revenue: {
          month: monthAnalytics[0].monthRevenue.length
            ? monthAnalytics[0].monthRevenue[0].totalBill
            : 0,
          lastMonth: lastMonthAnalytics[0].lastMonthRevenue.length
            ? lastMonthAnalytics[0].lastMonthRevenue[0].totalBill
            : 0,
        },
        ordersCompleted: {
          month: monthAnalytics[0].orderCompleteCounts.length
            ? monthAnalytics[0].orderCompleteCounts[0].completedCount
            : 0,
          lastMonth: lastMonthAnalytics[0].orderCompleteCounts.length
            ? lastMonthAnalytics[0].orderCompleteCounts[0].completedCount
            : 0,
        },
        ordersDecline: {
          month: monthAnalytics[0].orderDeclineCounts.length
            ? monthAnalytics[0].orderDeclineCounts[0].declineCount
            : 0,
          lastMonth: lastMonthAnalytics[0].orderDeclineCounts.length
            ? lastMonthAnalytics[0].orderDeclineCounts[0].declineCount
            : 0,
        },
        ordersCancel: {
          month: monthAnalytics[0].orderCancelCounts.length
            ? monthAnalytics[0].orderCancelCounts[0].cancelCount
            : 0,
          lastMonth: lastMonthAnalytics[0].orderCancelCounts.length
            ? lastMonthAnalytics[0].orderCancelCounts[0].cancelCount
            : 0,
        },
      };

      return { analytics };
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          msg: error,
        },
        HttpStatus.UNAUTHORIZED
      );
    }
  }
  async getAnalyticsOfWeek(req) {
    try {
      let { user } = req;
      const UserInfo = await this.foodCreatorModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw "User not found";
      }
      let weekAnalytics = await this.ordersModel.aggregate(
        WeekQueryAnalytics(UserInfo._id)
      );
      let lastWeekAnalytics = await this.ordersModel.aggregate(
        lastWeekQueryAnalytics(UserInfo._id)
      );
      let analytics = {
        revenue: {
          week: weekAnalytics[0].weekRevenue.length
            ? weekAnalytics[0].weekRevenue[0].totalBill
            : 0,
          lastWeek: lastWeekAnalytics[0].lastWeekRevenue.length
            ? lastWeekAnalytics[0].lastWeekRevenue[0].totalBill
            : 0,
        },
        ordersCompleted: {
          week: weekAnalytics[0].orderCompleteCounts.length
            ? weekAnalytics[0].orderCompleteCounts[0].completedCount
            : 0,
          lastWeek: lastWeekAnalytics[0].orderCompleteCounts.length
            ? lastWeekAnalytics[0].orderCompleteCounts[0].completedCount
            : 0,
        },
        ordersDecline: {
          week: weekAnalytics[0].orderDeclineCounts.length
            ? weekAnalytics[0].orderDeclineCounts[0].declineCount
            : 0,
          lastWeek: lastWeekAnalytics[0].orderDeclineCounts.length
            ? lastWeekAnalytics[0].orderDeclineCounts[0].declineCount
            : 0,
        },
        ordersCancel: {
          week: weekAnalytics[0].orderCancelCounts.length
            ? weekAnalytics[0].orderCancelCounts[0].cancelCount
            : 0,
          lastWeek: lastWeekAnalytics[0].orderCancelCounts.length
            ? lastWeekAnalytics[0].orderCancelCounts[0].cancelCount
            : 0,
        },
      };
      // console.log(analytics)
      return { analytics };
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          msg: error,
        },
        HttpStatus.UNAUTHORIZED
      );
    }
  }
  async getAnalyticsOfYear(req) {
    try {
      let { user } = req;
      const UserInfo = await this.foodCreatorModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw "User not found";
      }
      let yearAnalytics = await this.ordersModel.aggregate(
        yearQueryAnalytics(UserInfo._id)
      );
      let lastYearAnalytics = await this.ordersModel.aggregate(
        lastYearQueryAnalytics(UserInfo._id)
      );
      let analytics = {
        revenue: {
          year: yearAnalytics[0].yearRevenue.length
            ? yearAnalytics[0].yearRevenue[0].totalBill
            : 0,
          lastYear: lastYearAnalytics[0].lastYearRevenue.length
            ? lastYearAnalytics[0].lastYearRevenue[0].totalBill
            : 0,
        },
        ordersCompleted: {
          year: yearAnalytics[0].orderCompleteCounts.length
            ? yearAnalytics[0].orderCompleteCounts[0].completedCount
            : 0,
          lastYear: lastYearAnalytics[0].orderCompleteCounts.length
            ? lastYearAnalytics[0].orderCompleteCounts[0].completedCount
            : 0,
        },
        ordersDecline: {
          year: yearAnalytics[0].orderDeclineCounts.length
            ? yearAnalytics[0].orderDeclineCounts[0].declineCount
            : 0,
          lastYear: lastYearAnalytics[0].orderDeclineCounts.length
            ? lastYearAnalytics[0].orderDeclineCounts[0].declineCount
            : 0,
        },
        ordersCancel: {
          year: yearAnalytics[0].orderCancelCounts.length
            ? yearAnalytics[0].orderCancelCounts[0].cancelCount
            : 0,
          lastYear: lastYearAnalytics[0].orderCancelCounts.length
            ? lastYearAnalytics[0].orderCancelCounts[0].cancelCount
            : 0,
        },
      };
      // console.log(analytics)
      return { analytics };
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          msg: error,
        },
        HttpStatus.UNAUTHORIZED
      );
    }
  }
  async getAnalyticsOfAllTime(req) {
    try {
      let { user } = req;
      const UserInfo = await this.foodCreatorModel.findOne({
        phoneNo: user.phoneNo,
      });
      if (!UserInfo) {
        throw "User not found";
      }
      let allTimeAnalytics = await this.ordersModel.aggregate(
        AllTimeQueryAnalytics(UserInfo._id)
      );
      let analytics = {
        revenue: {
          allTime: allTimeAnalytics[0].allTimeRevenue.length
            ? allTimeAnalytics[0].allTimeRevenue[0].totalBill
            : 0,
        },
        ordersCompleted: {
          allTime: allTimeAnalytics[0].orderCompleteCounts.length
            ? allTimeAnalytics[0].orderCompleteCounts[0].completedCount
            : 0,
        },
        ordersDecline: {
          allTime: allTimeAnalytics[0].orderDeclineCounts.length
            ? allTimeAnalytics[0].orderDeclineCounts[0].declineCount
            : 0,
        },
        ordersCancel: {
          allTime: allTimeAnalytics[0].orderCancelCounts.length
            ? allTimeAnalytics[0].orderCancelCounts[0].cancelCount
            : 0,
        },
      };
      // console.log(analytics)
      return { analytics };
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          msg: error,
        },
        HttpStatus.UNAUTHORIZED
      );
    }
  }
}
