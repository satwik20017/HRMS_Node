import mysql2 from 'mysql2';

// Pool config
let mysqlConnection = {
  connectionLimit: 100,
  host: "localhost",
  user: "root",
  password: "123456",
  database: "HRMS_OWN",
  multipleStatements: true,
};

// Create pool
export const dbPool = mysql2.createPool(mysqlConnection);

// // Test connection once
// dbPool.getConnection((err, conn) => {
//   if (err) {
//     console.error("❌ MySQL not connected:", err.message);
//   } else {
//     console.log("✅ MySQL Connected");
//     conn.release(); // release connection back to pool
//   }
// });

// Export promise-based pool (for async/await queries)
export const db = dbPool.promise();

// Utility function (optional)
export async function dbconnections() {
  try {
    const connection = await db.getConnection(); // ✅ use promise-based API
    console.log("✅ MySQL connected successfully ");
    connection.release();
  } catch (err: any) {
    console.error("❌ MySQL not connected:", err.message);
  }
}
