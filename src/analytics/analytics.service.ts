import { Injectable } from "@nestjs/common";
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
import { lastWeekQueryAnalytics, WeekQueryAnalytics } from "./analyticsQueries/WeekQuery";
@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel("Orders") private readonly ordersModel: Model<Orders>
  ) {}
  async getAnalyticsOfToday(req) {
    let todayAnalytics = await this.ordersModel.aggregate(
      TodayQueryAnalytics("")
    );
    let yesterdayAnalytics = await this.ordersModel.aggregate(
      yesterdayQueryAnalytics("")
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
  }
  async getAnalyticsOfMonth(req) {
    let monthAnalytics = await this.ordersModel.aggregate(
      MonthQueryAnalytics("")
    );
    let lastMonthAnalytics = await this.ordersModel.aggregate(
      lastMonthQueryAnalytics("")
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
  }
  async getAnalyticsOfWeek(req) {
    let weekAnalytics = await this.ordersModel.aggregate(
     WeekQueryAnalytics("")
    );
    let lastWeekAnalytics = await this.ordersModel.aggregate(
      lastWeekQueryAnalytics("")
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
      console.log(analytics)
    return { analytics };
  }
}
