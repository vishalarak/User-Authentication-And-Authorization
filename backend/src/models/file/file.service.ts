// file.service.ts

import { Injectable, StreamableFile } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import * as ObjectsToCsv from 'objects-to-csv'; // Import the library for CSV conversion
import * as XLSX from 'xlsx';

@Injectable()
export class FileService {
  constructor(private readonly prismaService: PrismaService) {}

  async getDataFromDatabase(): Promise<any[]> {
    const data = await this.prismaService.user.findMany();
    return data.map((item) => ({
      id: item.id,
      firstName: item.first_name,
      lastName: item.last_name,
      email: item.email,
      role: item.role,
      city: item.city,
    }));
  }
  async getDataFromDatabaseAsCsv(): Promise<string> {
    const data = await this.getDataFromDatabase();
    console.log({ data });
    // Convert data to CSV format
    const csv = new ObjectsToCsv(data);

    // Return CSV as a string
    return csv.toString();
  }

  async getFileInJSON() {
    const data = await this.prismaService.user.findMany();
    const jsonBuffer = Buffer.from(JSON.stringify(data, null, 2));
    return new StreamableFile(jsonBuffer);
  }

  async getFileInXLSheet() {
    const data = await this.prismaService.user.findMany();
    const workSheet = XLSX.utils.json_to_sheet(data);
    const workBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, 'Users');
    const excelBuffer = XLSX.write(workBook, {
      type: 'buffer',
      bookType: 'xlsx',
    });
    return excelBuffer;
  }
}
