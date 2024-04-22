import { createObjectCsvWriter } from "csv-writer";

type Data = {
  [key: string]: any;
};

export const writeCsv = (filePath: string, header: string[], data: Data[]) => {
  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: header.map((columnName) => ({
      id: columnName,
      title: columnName,
    })),
  });

  const records = data.map((record) => {
    const sanitizedRecord: Partial<Data> = {};
    for (const columnName of header) {
      sanitizedRecord[columnName] = record[columnName];
    }
    return sanitizedRecord;
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
