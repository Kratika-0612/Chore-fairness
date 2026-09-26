import { Client, Databases, ID, Query } from "appwrite";

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("6ab6bd79000009cfc28e");

export const databases = new Databases(client);
export const DB_ID = "6ab6bd84002e929506d5";


export const USER_YOU_ID = "6ab7854c000e732d2cf4";
export const USER_BOB_ID = "6ab7856a00391a9db0cb";

export async function logChore(userId, chore, effortOverride) {
  return databases.createDocument(
    DB_ID,
    "logEntries",
    ID.unique(),
    {
      userId,
      choreId: chore.id,
      choreName: chore.name,
      weight: effortOverride ?? chore.defaultWeight,
      timestamp: new Date().toISOString(),
    }
  );
}

export async function getWeekLogs() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const res = await databases.listDocuments(DB_ID, "logEntries", [
    Query.greaterThanEqual("timestamp", sevenDaysAgo),
    Query.orderDesc("timestamp"),
    Query.limit(500),
  ]);
  return res.documents;
}