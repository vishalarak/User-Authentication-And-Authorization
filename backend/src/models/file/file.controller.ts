import {
  Controller,
  Get,
  Res,
  HttpException,
  HttpStatus,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { FileService } from './file.service';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @UseGuards(AuthGuard)
  @Get('example')
  getFile(@Res({ passthrough: true }) res: Response): StreamableFile {
    const file = createReadStream(join(process.cwd(), 'package.json'));
    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="package.json"',
    });
    return new StreamableFile(file);
  }

  @UseGuards(AuthGuard)
  @Get('get-file')
  async getData(
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="users.json"',
    });
    return await this.fileService.getFileInJSON();
  }

  @UseGuards(AuthGuard)
  @Get('download')
  async downloadFile(@Res() res: Response) {
    try {
      // Fetch data from the database
      const data = await this.fileService.getDataFromDatabase();

      // Convert data to JSON string
      const jsonData = JSON.stringify(data, null, 2);

      // Set headers for file download
      res.set({
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="users.json"',
      });

      // Stream the file to the response
      res.send(jsonData);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw new HttpException(
        'Error downloading file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Get('download-csv')
  async downloadCsv(@Res() res: Response) {
    try {
      // Fetch data from the database and convert to CSV
      const csvData = await this.fileService.getDataFromDatabaseAsCsv();

      // Set headers for file download
      res.set({
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="users.csv"',
      });

      // Stream the CSV data to the response
      res.send(csvData);
    } catch (error) {
      console.error('Error downloading CSV file:', error);
      throw new HttpException(
        'Error downloading CSV file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Get('download-excel')
  async downloadExcel(@Res() res: Response) {
    try {
      const excelData = await this.fileService.getFileInXLSheet();
      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="users.xlsx"',
      });
      res.send(excelData);
    } catch (error) {
      console.error('Error downloading Excel file:', error);
      throw new HttpException(
        'Error downloading Excel file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
