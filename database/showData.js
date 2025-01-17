const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("studybuddy.db");

/**
 * 1) Show aggregate stats for USERS
 *    - totalUsers
 *    - paidUsers
 *    - freeUsers
 *    - optionally, how many are active subscriptions, etc.
 */
db.get("SELECT COUNT(*) AS totalUsers FROM users", (err, row) => {
  if (err) return console.error("Error fetching totalUsers:", err);
  console.log("Total Users:", row.totalUsers);
});

db.get(
  "SELECT COUNT(*) AS paidUsers FROM users WHERE accountType = 'paid'",
  (err, row) => {
    if (err) return console.error("Error fetching paidUsers:", err);
    console.log("Paid Users:", row.paidUsers);
  }
);

db.get(
  "SELECT COUNT(*) AS freeUsers FROM users WHERE accountType = 'free'",
  (err, row) => {
    if (err) return console.error("Error fetching freeUsers:", err);
    console.log("Free Users:", row.freeUsers);
  }
);

// If you track subscriptionStatus (like 'active', 'canceled', etc.)
db.get(
  "SELECT COUNT(*) AS activeSubs FROM users WHERE subscriptionStatus = 'active'",
  (err, row) => {
    if (err) return console.error("Error fetching activeSubs:", err);
    console.log("Active Subscriptions:", row.activeSubs);
  }
);

/**
 * 2) Show aggregate stats for FLASHCARDS
 *    - total flashcard sessions
 *    - (optionally) average # of flashcards per session
 */
db.get("SELECT COUNT(*) AS totalSessions FROM flashcards", (err, row) => {
  if (err) return console.error("Error fetching totalSessions:", err);
  console.log("Total Flashcard Sessions:", row.totalSessions);
});

// Example: parse each row’s flashcardsJSON to find the total # of flashcards
db.all("SELECT flashcardsJSON FROM flashcards", (err, rows) => {
  if (err) return console.error("Error fetching flashcards rows:", err);

  let totalFlashcardsCount = 0;
  rows.forEach((r) => {
    if (r.flashcardsJSON) {
      try {
        const arr = JSON.parse(r.flashcardsJSON);
        totalFlashcardsCount += arr.length;
      } catch (parseErr) {
        // handle parse error if needed
      }
    }
  });

  const totalSessions = rows.length;
  const avgFlashcardsPerSession =
    totalSessions > 0
      ? (totalFlashcardsCount / totalSessions).toFixed(2)
      : 0;

  console.log("Total Flashcards (summed across all sessions):", totalFlashcardsCount);
  console.log("Average Flashcards per Session:", avgFlashcardsPerSession);
});

/**
 * 3) Print all rows if you still want details
 **/
db.all("SELECT * FROM users", (err, rows) => {
  if (err) return console.error(err);
  console.log("Users table (detailed):", rows);
});
// db.all("SELECT * FROM flashcards", (err, rows) => {
//   if (err) return console.error(err);
//   console.log("Flashcards table (detailed):", rows);
// });

/**
 * Close the DB after a short delay to ensure queries complete.
 * Or wrap each query in a Promise and close the DB only after all have resolved.
 */
setTimeout(() => {
  db.close();
}, 1000);
