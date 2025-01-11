const readline = require("readline");

// Function to locate the CSV file
async function getCSVFilePath() {
    const userInput = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        userInput.question(
            "Enter the full path of the CSV file: ",
            (filePath) => {
                // Replace single backslashes with double backslashes
                const sanitizedPath = filePath.replace(/\\/g, "\\\\");
                resolve(sanitizedPath.trim());
                userInput.close();
            }
        );
    });
}

module.exports = { getCSVFilePath };
