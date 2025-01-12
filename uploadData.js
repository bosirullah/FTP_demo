const oracledb = require("oracledb");
const fs = require("fs");
const readline = require("readline");
const { getCSVFilePath } = require("./utils/csvFilePathLocater");

require("dotenv").config();

const username = process.env.USER;
const password = process.env.PASSWORD;
const serviceName = process.env.SERVICE_NAME;

const dbConfig = {
    user: username,
    password: password,
    connectString: serviceName,
};

async function loadCSV() {
    let connection;

    try {
        // Prompt user to locate the CSV file
        const csvFilePath = await getCSVFilePath();
        console.log(`CSV File Path: ${csvFilePath}`);

        if (!fs.existsSync(csvFilePath)) {
            throw new Error("The specified file does not exist.");
        }

        // Generate a unique table name based on timestamp
        const tableName = `table_${Date.now()}`;

        // Connect to the database
        connection = await oracledb.getConnection(dbConfig);
        console.log("Connected to the database");

        // Create a new table dynamically
        const createTableSQL = `
            CREATE TABLE ${tableName} (
                column1 VARCHAR2(100),
                column2 VARCHAR2(100),
                column3 DATE
            )
        `;

        await connection.execute(createTableSQL);
        console.log(`Created table: ${tableName}`);

        // Read the CSV file line by line
        const fileStream = fs.createReadStream(csvFilePath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity,
        });

        // Read and print each line
        // rl.on("line", (line) => {
        //     console.log(line);
        // });

        // rl.on("close", () => {
        //     console.log("Finished reading the file.");
        // });

        // Skip the header
        let isHeader = true;

        // Prepare SQL statement
        const insertSQL = `INSERT INTO ${tableName} (column1, column2, column3) VALUES (:1, :2, TO_DATE(:3, 'YYYY-MM-DD'))`;

        for await (const line of rl) {
            if (isHeader) {
                isHeader = false; // Skip header
                continue;
            }

            const row = line.split(","); // Split CSV row by comma
            // Insert data into the database
            await connection.execute(insertSQL, row, { autoCommit: false });
        }

        // Commit transaction
        await connection.commit();
        console.log(`Data loaded successfully into ${tableName}`);
    } catch (err) {
        console.error("Error loading data: ", err);
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log("Connection closed!");
            } catch (err) {
                console.error("Error closing connection: ", err);
            }
        }
    }
}

loadCSV();
