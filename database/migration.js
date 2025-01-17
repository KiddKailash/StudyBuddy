/**
 * This script:
 *   - Connects to MongoDB
 *   - Connects to studybuddy.db
 *   - Upserts users, flashcards, and notion_authorizations
 */

require("dotenv").config();
const { MongoClient } = require("mongodb");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

(async () => {
  // 1) Connect to MongoDB
  console.log("Connecting to MongoDB...");
  const mongoClient = new MongoClient(process.env.DATABASE_URL);
  await mongoClient.connect();
  const mongoDB = mongoClient.db("studybuddy");

  // 2) Fetch documents from MongoDB
  console.log("Fetching users, flashcards, notion_authorizations from MongoDB...");
  const mongoUsers = await mongoDB.collection("users").find().toArray();
  let mongoFlashcards = [];
  let mongoNotionAuths = [];
  
  // If you have a flashcards collection, fetch them
  try {
    mongoFlashcards = await mongoDB.collection("flashcards").find().toArray();
  } catch (err) {
    console.warn("No flashcards collection found in MongoDB or error reading it:", err.message);
  }

  // If you have a notion_authorizations collection, fetch them
  try {
    mongoNotionAuths = await mongoDB.collection("notion_authorizations").find().toArray();
  } catch (err) {
    console.warn("No notion_authorizations collection found or error reading it:", err.message);
  }

  console.log(
    `Fetched ${mongoUsers.length} users, ${mongoFlashcards.length} flashcards, ${mongoNotionAuths.length} notion entries from MongoDB.`
  );

  // 3) Connect to SQLite
  console.log("Opening SQLite database...");
  const dbPath = path.join(__dirname, "studybuddy.db");
  const sqliteDB = new sqlite3.Database(dbPath);

  // Enable foreign keys
  await new Promise((resolve, reject) => {
    sqliteDB.run("PRAGMA foreign_keys = ON;", (err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  // 4) Upsert Users
  //    We'll use email as the unique field to match existing rows in SQLite
  const userUpsertQuery = 
    `INSERT INTO users (
      email,
      password,
      firstName,
      lastName,
      company,
      accountType,
      createdAt,
      stripeCustomerId,
      subscriptionId,
      subscriptionStatus,
      lastInvoice,
      paymentStatus
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET
      password = excluded.password,
      firstName = excluded.firstName,
      lastName = excluded.lastName,
      company = excluded.company,
      accountType = excluded.accountType,
      createdAt = excluded.createdAt,
      stripeCustomerId = excluded.stripeCustomerId,
      subscriptionId = excluded.subscriptionId,
      subscriptionStatus = excluded.subscriptionStatus,
      lastInvoice = excluded.lastInvoice,
      paymentStatus = excluded.paymentStatus`
  ;
  // ^ This uses SQLite's "INSERT ... ON CONFLICT(email) DO UPDATE" approach.

  console.log("Upserting users into SQLite...");
  for (const user of mongoUsers) {
    // Convert createdAt to a string if it's a Date
    let createdAtStr = null;
    if (user.createdAt instanceof Date) {
      createdAtStr = user.createdAt.toISOString();
    } else if (typeof user.createdAt === "string") {
      createdAtStr = user.createdAt;
    }

    // We assume email is guaranteed to exist in MongoDB user documents
    // If any might not have email, handle that separately.
    await new Promise((resolve, reject) => {
      sqliteDB.run(
        userUpsertQuery,
        [
          user.email,
          user.password || "",
          user.firstName || null,
          user.lastName || null,
          user.company || null,
          user.accountType || "free",
          createdAtStr,
          user.stripeCustomerId || null,
          user.subscriptionId || null,
          user.subscriptionStatus || null,
          user.lastInvoice || null,
          user.paymentStatus || null,
        ],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }
  console.log("Users upserted successfully.");

  // 5) Upsert Flashcards
  //    We'll do a simplified approach: match on a combination of user email + studySession
  //    or use an extra mongoId column if you have it in the flashcards table.
  //    Example approach: we might have "mongoId TEXT UNIQUE" in flashcards.
  //    If you stored mongoId in your schema, let's do "ON CONFLICT(mongoId)".
  //
  //    If you don't have mongoId in your schema, you must define a unique approach
  //    for identifying existing flashcards.

  // If your flashcards table has "mongoId TEXT UNIQUE", we can do:
  const flashcardUpsertQuery = 
    `INSERT INTO flashcards (
      mongoId,
      userId,
      studySession,
      flashcardsJSON,
      transcript,
      createdDate
    ) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(mongoId) DO UPDATE SET
      userId = excluded.userId,
      studySession = excluded.studySession,
      flashcardsJSON = excluded.flashcardsJSON,
      transcript = excluded.transcript,
      createdDate = excluded.createdDate`
  ;

  // We'll need a function to get the new user's SQLite id from their email
  // (because we don't have the old userId as an integer).
  async function getSqliteUserIdByEmail(email) {
    return new Promise((resolve, reject) => {
      sqliteDB.get(
        "SELECT id FROM users WHERE email = ?",
        [email],
        (err, row) => {
          if (err) return reject(err);
          resolve(row ? row.id : null);
        }
      );
    });
  }

  console.log("Upserting flashcards into SQLite (using mongoId)...");
  for (const fc of mongoFlashcards) {
    // We assume each flashcard doc has:
    //   - fc._id (ObjectId)
    //   - fc.userId (ObjectId) referencing the same user in Mongo
    //   - fc.studySession, fc.flashcardsJSON, fc.transcript, fc.createdDate
    //
    // We must find the corresponding user's email from userId, or we could store userId
    // in a map while migrating users. Here we do a simplified approach:
    //   - If you stored user.email in flashcards, you can skip userId lookup
    //   - Otherwise, you'd need a "userIdMap" from earlier. For demonstration,
    //     we'll fetch the email from the user doc for this userId.

    // (A) Find the user doc that matches fc.userId
    const userDoc = mongoUsers.find((u) => u._id?.toString() === fc.userId?.toString());
    if (!userDoc || !userDoc.email) {
      console.warn(`Flashcard doc ${fc._id} references a userId not found or user has no email.`);
      continue;
    }

    // (B) Get the SQLite user id
    const sqliteUserId = await getSqliteUserIdByEmail(userDoc.email);
    if (!sqliteUserId) {
      console.warn(`User not found in SQLite for email ${userDoc.email}. Skipping flashcard ${fc._id}.`);
      continue;
    }

    // (C) Convert createdDate
    let createdDateStr = null;
    if (fc.createdDate instanceof Date) {
      createdDateStr = fc.createdDate.toISOString();
    } else if (typeof fc.createdDate === "string") {
      createdDateStr = fc.createdDate;
    }

    // (D) Convert the flashcards array to JSON
    const flashcardsJSON = JSON.stringify(fc.flashcardsJSON || []);

    // (E) Upsert
    await new Promise((resolve, reject) => {
      sqliteDB.run(
        flashcardUpsertQuery,
        [
          fc._id?.toString() || null, // mongoId
          sqliteUserId,
          fc.studySession || null,
          flashcardsJSON,
          fc.transcript || null,
          createdDateStr,
        ],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }
  console.log("Flashcards upserted successfully.");

  // 6) Upsert Notion Authorizations (if you use them)
  //    We'll match by userId in your SQLite DB. We'll store userId as an integer.
  //    In your notion_authorizations table, you have "userId INTEGER UNIQUE"? 
  //    If it's unique, you can do ON CONFLICT(userId)...

  const notionUpsertQuery = 
    `INSERT INTO notion_authorizations (
      userId,
      accessToken,
      workspaceId,
      workspaceName,
      botId,
      owner,
      integrationDate
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(userId) DO UPDATE SET
      accessToken = excluded.accessToken,
      workspaceId = excluded.workspaceId,
      workspaceName = excluded.workspaceName,
      botId = excluded.botId,
      owner = excluded.owner,
      integrationDate = excluded.integrationDate`
  ;

  console.log("Upserting notion_authorizations into SQLite...");
  for (const na of mongoNotionAuths) {
    // We have something like:
    //   { userId: ObjectId, accessToken: String, workspaceId: String, ... }
    // Find the user doc in Mongo, so we can get the user email:
    const userDoc = mongoUsers.find((u) => u._id?.toString() === na.userId?.toString());
    if (!userDoc || !userDoc.email) {
      console.warn(`Notion auth doc ${na._id} references a userId not found or user has no email.`);
      continue;
    }

    const sqliteUserId = await getSqliteUserIdByEmail(userDoc.email);
    if (!sqliteUserId) {
      console.warn(`User not found in SQLite for email ${userDoc.email}. Skipping notion_auth ${na._id}.`);
      continue;
    }

    const integrationDateStr =
      na.integrationDate instanceof Date
        ? na.integrationDate.toISOString()
        : typeof na.integrationDate === "string"
        ? na.integrationDate
        : null;

    await new Promise((resolve, reject) => {
      sqliteDB.run(
        notionUpsertQuery,
        [
          sqliteUserId,
          na.accessToken || null,
          na.workspaceId || null,
          na.workspaceName || null,
          na.botId || null,
          typeof na.owner === "object" ? JSON.stringify(na.owner) : null,
          integrationDateStr,
        ],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }
  console.log("Notion authorizations upserted successfully.");

  // 7) Close connections
  console.log("Closing all connections...");
  await mongoClient.close();
  sqliteDB.close();
  console.log("Migration complete!");
  process.exit(0);
})().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});