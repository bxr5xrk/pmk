import { Data } from "src/types";

export function getUniqueData(data: Data): Data {
  return Object.entries(data).reduce((acc, [key, value]) => {
    if (!acc[key]) {
      acc[key] = value;
    }
    return acc;
  }, {} as Data);
}