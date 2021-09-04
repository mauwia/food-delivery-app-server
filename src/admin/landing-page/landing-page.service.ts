import { Injectable } from '@nestjs/common';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import * as excel from 'exceljs';

@Injectable()
export class LandingPageService {
  constructor(
    @InjectConnection('landingPage') private connection: Connection,
  ) {}

  async getBetaUsers (user) {
    const data = await this.connection.collection(process.env.BETA_USERS_COLLECTION).find().toArray();
    const columns = [
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone Number', key: 'phoneNo', width: 30},
      { header: 'Role', key: 'role', width: 10, outlineLevel: 1}
    ];

    return this.exportToExcelUtility(columns, data, 'All Beta Users', user.email);
  }

  async exportToExcelUtility (columns, rows, sheetName, email) {
    // Creating a workbook
    let workbook = new excel.Workbook();
    workbook.creator = email;
    workbook.lastModifiedBy = email;
    workbook.created = new Date();
    workbook.modified = new Date();

    // Adding worksheet to workbook
    let worksheet = workbook.addWorksheet(sheetName, {
      views: [{ state: "frozen", xSplit: 0, ySplit: 1 }],
    });
    worksheet.state = "visible";
    worksheet.properties.defaultColWidth = 30;
    worksheet.columns = columns;
    worksheet.addRows(rows);

    return workbook;
  }
}
