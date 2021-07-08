import { Routes } from 'nest-router';
import { AdminModule } from '../admin/admin.module';
import { FoodCreatorsModule } from '../admin/food-creators/food-creators.module';
import { FoodLoversModule } from '../admin/food-lovers/food-lovers.module';

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
      }
    ],
  },
];

export default routes;
