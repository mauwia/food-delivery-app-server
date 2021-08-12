import { Routes } from 'nest-router';
import { AdminModule } from '../admin/admin.module';
import { FoodLoversModule } from '../admin/food-lovers/food-lovers.module';
import { AdminNotificationModule } from './admin-notification/admin-notification.module'
import { FoodCreatorsModule } from '../admin/food-creators/food-creators.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { AnalyticsModule } from 'src/admin/analytics/analytics.module';

const routes: Routes = [
  {
    path: '/admin',
    module: AdminModule,
    children: [
      {
        path: '/food-creators',
        module: FoodCreatorsModule,
      },
      {
        path: '/food-lovers',
        module: FoodLoversModule,
      },
      {
        path: '/notifications',
        module: AdminNotificationModule,
      },
      {
        path: '/orders',
        module: OrdersModule,
      },
      {
        path: '/auth',
        module: AuthModule,
      },
      {
        path: '/metrics',
        module: AnalyticsModule,
      },
    ],
  },
];

export default routes;
