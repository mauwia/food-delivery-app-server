import { Routes } from 'nest-router';
import { AdminModule } from '../admin/admin.module';
import { FoodCreatorsModule } from '../admin/food-creators/food-creators.module';

const routes: Routes = [
  {
    path: '/admin',
    module: AdminModule,
    children: [
      {
        path: '/food-creators',
        module: FoodCreatorsModule,
      }
    ],
  },
];

export default routes;
