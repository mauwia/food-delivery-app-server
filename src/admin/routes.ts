import { Routes } from 'nest-router';
import { AdminModule } from '../admin/admin.module';
import { FoodLoversModule } from '../admin/food-lovers/food-lovers.module';
import { AdminNotificationModule } from './admin-notification/admin-notification.module'
import { FoodCreatorsModule } from '../admin/food-creators/food-creators.module';

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
    ],
  },
];

export default routes;
