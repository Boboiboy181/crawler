import { createObjectCsvWriter } from "csv-writer";

export const writeCsv = (filePath: string, header: string[], data: any[][]) => {
  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: header.map((columnName) => ({
      id: columnName,
      title: columnName,
    })),
  });

  const records = data.map((record) => {
    const recordObject: {
      [key: string]: any;
    } = {};
    header.forEach((columnName, index) => {
      recordObject[columnName] = record[index];
    });
    return recordObject;
  });

  csvWriter
    .writeRecords(records)
    .then(() => {
      console.log(`CSV file "${filePath}" written successfully.`);
    })
    .catch((error) => {
      console.error(`Error writing CSV file "${filePath}":`, error);
    });
};