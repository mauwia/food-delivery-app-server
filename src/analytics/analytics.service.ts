import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Orders } from "src/orders/orders.model";
import * as moment from "moment";
import {
  revenuePerHourQuery,
  TodayQueryAnalytics,
  todayReviewAnalyticQuery,
  yesterdayQueryAnalytics,
  yesterdayReviewAnalyticQuery,
} from "./analyticsQueries/OneDayQuery";
import {
  MonthQueryAnalytics,
  revenuePerMonthQuery,
  lastMonthQueryAnalytics,
  monthReviewAnalyticQuery,
  lastMonthReviewAnalyticQuery,
} from "./analyticsQueries/MonthQuery";
import {
  revenuePerWeekQuery,
  lastWeekQueryAnalytics,
  lastWeekReviewAnalyticQuery,
  WeekQueryAnalytics,
  weekReviewAnalyticQuery,
} from "./analyticsQueries/WeekQuery";
import {
  lastYearQueryAnalytics,
  lastYearReviewAnalyticQuery,
  revenuePerYearQuery,
  yearQueryAnalytics,
  yearReviewAnalyticQuery,
} from "./analyticsQueries/YearQuery";
import {
  AllTimeQueryAnalytics,
  allTimeReviewAnalyticQuery,
} from "./analyticsQueries/AllTimeQuery";
import { FoodCreator } from "src/food-creator/food-creator.model";
import { Review } from "src/review/review.model";
@Injectable()
export class AnalyticsService {
  private logger = new Logger("Food Lover");
  constructor(
    @InjectModel("Orders") private readonly ordersModel: Model<Orders>,
    @InjectModel("FoodCreator")
    private readonly foodCreatorModel: Model<FoodCreator>,
    @InjectModel("Reviews") private readonly reviewModel: Model<Review>
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
      let revenuePerHour = await this.ordersModel.aggregate(
        revenuePerHourQuery(UserInfo._id)
      );

      let todayReviews = await this.reviewModel.aggregate(
        todayReviewAnalyticQuery(UserInfo._id)
      );
      let yesterdayReviews = await this.reviewModel.aggregate(
        yesterdayReviewAnalyticQuery(UserInfo._id)
      );
      let todayAnalytics = await this.ordersModel.aggregate(
        TodayQueryAnalytics(UserInfo._id)
      );
      let yesterdayAnalytics = await this.ordersModel.aggregate(
        yesterdayQueryAnalytics(UserInfo._id)
      );
      let analytics = {
        revenuePerHour,
        fiveStars: {
          today: todayReviews[0].total5Stars.length
            ? todayReviews[0].total5Stars[0].fiveStars
            : 0,
          yesterday: yesterdayReviews[0].total5Stars.length
            ? yesterdayReviews[0].total5Stars[0].fiveStars
            : 0,
        },
        fourStars: {
          today: todayReviews[0].total4Stars.length
            ? todayReviews[0].total4Stars[0].fourStars
            : 0,
          yesterday: yesterdayReviews[0].total4Stars.length
            ? yesterdayReviews[0].total4Stars[0].fourStars
            : 0,
        },
        threeStars: {
          today: todayReviews[0].total3Stars.length
            ? todayReviews[0].total3Stars[0].threeStars
            : 0,
          yesterday: yesterdayReviews[0].total3Stars.length
            ? yesterdayReviews[0].total3Stars[0].threeStars
            : 0,
        },
        twoStars: {
          today: todayReviews[0].total2Stars.length
            ? todayReviews[0].total2Stars[0].twoStars
            : 0,
          yesterday: yesterdayReviews[0].total2Stars.length
            ? yesterdayReviews[0].total2Stars[0].twoStars
            : 0,
        },
        oneStar: {
          today: todayReviews[0].total1Stars.length
            ? todayReviews[0].total1Stars[0].oneStar
            : 0,
          yesterday: yesterdayReviews[0].total1Stars.length
            ? yesterdayReviews[0].total1Stars[0].oneStar
            : 0,
        },
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
      let revenuePerMonth = await this.ordersModel.aggregate(
        revenuePerMonthQuery(UserInfo._id)
      );
      let monthAnalytics = await this.ordersModel.aggregate(
        MonthQueryAnalytics(UserInfo._id)
      );
      let lastMonthAnalytics = await this.ordersModel.aggregate(
        lastMonthQueryAnalytics(UserInfo._id)
      );
      let monthReviewAnalytics = await this.reviewModel.aggregate(
        monthReviewAnalyticQuery(UserInfo._id)
      );

      let lastMonthReviewAnalytics = await this.reviewModel.aggregate(
        lastMonthReviewAnalyticQuery(UserInfo._id)
      );

      let analytics = {
        revenuePerMonth,
        fiveStars: {
          month: monthReviewAnalytics[0].total5Stars.length
            ? monthReviewAnalytics[0].total5Stars[0].fiveStars
            : 0,
          lastMonth: lastMonthReviewAnalytics[0].total5Stars.length
            ? lastMonthReviewAnalytics[0].total5Stars[0].fiveStars
            : 0,
        },
        fourStars: {
          month: monthReviewAnalytics[0].total4Stars.length
            ? monthReviewAnalytics[0].total4Stars[0].fourStars
            : 0,
          lastMonth: lastMonthReviewAnalytics[0].total4Stars.length
            ? lastMonthReviewAnalytics[0].total4Stars[0].fourStars
            : 0,
        },
        threeStars: {
          month: monthReviewAnalytics[0].total3Stars.length
            ? monthReviewAnalytics[0].total3Stars[0].threeStars
            : 0,
          lastMonth: lastMonthReviewAnalytics[0].total3Stars.length
            ? lastMonthReviewAnalytics[0].total3Stars[0].threeStars
            : 0,
        },
        twoStars: {
          month: monthReviewAnalytics[0].total2Stars.length
            ? monthReviewAnalytics[0].total2Stars[0].twoStars
            : 0,
          lastMonth: lastMonthReviewAnalytics[0].total2Stars.length
            ? lastMonthReviewAnalytics[0].total2Stars[0].twoStars
            : 0,
        },
        oneStar: {
          month: monthReviewAnalytics[0].total1Stars.length
            ? monthReviewAnalytics[0].total1Stars[0].oneStar
            : 0,
          lastMonth: lastMonthReviewAnalytics[0].total1Stars.length
            ? lastMonthReviewAnalytics[0].total1Stars[0].oneStar
            : 0,
        },
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
      let revenuePerWeek = await this.ordersModel.aggregate(
        revenuePerWeekQuery(UserInfo._id)
      );
      let weekReviews = await this.reviewModel.aggregate(
        weekReviewAnalyticQuery(UserInfo._id)
      );
      let lastWeekReviews = await this.reviewModel.aggregate(
        lastWeekReviewAnalyticQuery(UserInfo._id)
      );
      let weekAnalytics = await this.ordersModel.aggregate(
        WeekQueryAnalytics(UserInfo._id)
      );
      let lastWeekAnalytics = await this.ordersModel.aggregate(
        lastWeekQueryAnalytics(UserInfo._id)
      );
      let analytics = {
        revenuePerWeek,
        fiveStars: {
          week: weekReviews[0].total5Stars.length
            ? weekReviews[0].total5Stars[0].fiveStars
            : 0,
          lastWeek: lastWeekReviews[0].total5Stars.length
            ? lastWeekReviews[0].total5Stars[0].fiveStars
            : 0,
        },
        fourStars: {
          week: weekReviews[0].total4Stars.length
            ? weekReviews[0].total4Stars[0].fourStars
            : 0,
          lastWeek: lastWeekReviews[0].total4Stars.length
            ? lastWeekReviews[0].total4Stars[0].fourStars
            : 0,
        },
        threeStars: {
          week: weekReviews[0].total3Stars.length
            ? weekReviews[0].total3Stars[0].threeStars
            : 0,
          lastWeek: lastWeekReviews[0].total3Stars.length
            ? lastWeekReviews[0].total3Stars[0].threeStars
            : 0,
        },
        twoStars: {
          week: weekReviews[0].total2Stars.length
            ? weekReviews[0].total2Stars[0].twoStars
            : 0,
          lastWeek: lastWeekReviews[0].total2Stars.length
            ? lastWeekReviews[0].total2Stars[0].twoStars
            : 0,
        },
        oneStar: {
          week: weekReviews[0].total1Stars.length
            ? weekReviews[0].total1Stars[0].oneStar
            : 0,
          lastWeek: lastWeekReviews[0].total1Stars.length
            ? lastWeekReviews[0].total1Stars[0].oneStar
            : 0,
        },
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
      let revenuePerYear = await this.ordersModel.aggregate(
        revenuePerYearQuery(UserInfo._id)
      );
      let yearReviews = await this.reviewModel.aggregate(
        yearReviewAnalyticQuery(UserInfo._id)
      );
      let lastYearReviews = await this.reviewModel.aggregate(
        lastYearReviewAnalyticQuery(UserInfo._id)
      );
      let yearAnalytics = await this.ordersModel.aggregate(
        yearQueryAnalytics(UserInfo._id)
      );
      let lastYearAnalytics = await this.ordersModel.aggregate(
        lastYearQueryAnalytics(UserInfo._id)
      );
      let analytics = {
        revenuePerYear,
        fiveStars: {
          year: yearReviews[0].total5Stars.length
            ? yearReviews[0].total5Stars[0].fiveStars
            : 0,
          lastYear: lastYearReviews[0].total5Stars.length
            ? lastYearReviews[0].total5Stars[0].fiveStars
            : 0,
        },
        fourStars: {
          year: yearReviews[0].total4Stars.length
            ? yearReviews[0].total4Stars[0].fourStars
            : 0,
          lastYear: lastYearReviews[0].total4Stars.length
            ? lastYearReviews[0].total4Stars[0].fourStars
            : 0,
        },
        threeStars: {
          year: yearReviews[0].total3Stars.length
            ? yearReviews[0].total3Stars[0].threeStars
            : 0,
          lastYear: lastYearReviews[0].total3Stars.length
            ? lastYearReviews[0].total3Stars[0].threeStars
            : 0,
        },
        twoStars: {
          year: yearReviews[0].total2Stars.length
            ? yearReviews[0].total2Stars[0].twoStars
            : 0,
          lastYear: lastYearReviews[0].total2Stars.length
            ? lastYearReviews[0].total2Stars[0].twoStars
            : 0,
        },
        oneStar: {
          year: yearReviews[0].total1Stars.length
            ? yearReviews[0].total1Stars[0].oneStar
            : 0,
          lastYear: lastYearReviews[0].total1Stars.length
            ? lastYearReviews[0].total1Stars[0].oneStar
            : 0,
        },
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
      let allTimeReviews = await this.reviewModel.aggregate(
        allTimeReviewAnalyticQuery(UserInfo._id)
      );
      let revenuePerYear = await this.ordersModel.aggregate(
        revenuePerYearQuery(UserInfo._id)
      );
      let analytics = {
        revenuePerYear,
        fiveStars: {
          allTime: allTimeReviews[0].total5Stars.length
            ? allTimeReviews[0].total5Stars[0].fiveStars
            : 0,
        },
        fourStars: {
          allTime: allTimeReviews[0].total4Stars.length
            ? allTimeReviews[0].total4Stars[0].fourStars
            : 0,
        },
        threeStars: {
          allTime: allTimeReviews[0].total3Stars.length
            ? allTimeReviews[0].total3Stars[0].threeStars
            : 0,
        },
        twoStars: {
          allTime: allTimeReviews[0].total2Stars.length
            ? allTimeReviews[0].total2Stars[0].twoStars
            : 0,
        },
        oneStar: {
          allTime: allTimeReviews[0].total1Stars.length
            ? allTimeReviews[0].total1Stars[0].oneStar
            : 0,
        },
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
