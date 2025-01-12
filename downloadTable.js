const oracledb = require("oracledb");
const fs = require("fs");
const readline = require("readline");
const { Parser } = require("json2csv");

require("dotenv").config();

const username = process.env.USER;
const password = process.env.PASSWORD;
const serviceName = process.env.SERVICE_NAME;

const dbConfig = {
    user: username,
    password: password,
    connectString: serviceName,
};

async function downloadTableData() {
    let connection;

    try {
        // Prompt user for the table name
        const userInput = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        const tableName = await new Promise((resolve) => {
            userInput.question(
                "Enter the table name to download: ",
                (answer) => {
                    resolve(answer.trim());
                    userInput.close();
                }
            );
        });

        // Connect to the Oracle Database
        connection = await oracledb.getConnection(dbConfig);
        console.log("Connected to the database");

        // Query to fetch table data
        const query = `SELECT * FROM ${tableName}`;
        const result = await connection.execute(query);

        if (result.rows.length === 0) {
            console.log(`No data found in table: ${tableName}`);
            return;
        }

        // Convert rows to CSV format
        const jsonData = result.rows.map((row, index) => {
            const columns = result.metaData.map((col) => col.name);
            return columns.reduce((acc, columnName, i) => {
                acc[columnName] = row[i];
                return acc;
            }, {});
        });

        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(jsonData);

        // Write CSV data to a file
        const filePath = `C:\\Users\\mdbos\\OneDrive\\Desktop\\FTP_demo\\${tableName}_data.csv`;
        fs.writeFileSync(filePath, csv);

        console.log(`Data successfully saved to ${filePath}`);
    } catch (err) {
        console.error("Error downloading table data:", err);
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log("Connection closed");
            } catch (err) {
                console.error("Error closing connection: ", err);
            }
        }
    }
}

downloadTableData();
