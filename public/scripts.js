/*
 * These functions below are for various webpage functionalities. 
 * Each function serves to process data on the frontend:
 *      - Before sending requests to the backend.
 *      - After receiving responses from the backend.
 * 
 * To tailor them to your specific needs,
 * adjust or expand these functions to match both your 
 *   backend endpoints 
 * and 
 *   HTML structure.
 * 
 */


// This function checks the database connection and updates its status on the frontend.
async function checkDbConnection() {
    const statusElem = document.getElementById('dbStatus');
    const loadingGifElem = document.getElementById('loadingGif');

    const response = await fetch('/check-db-connection', { method: "GET" });

    loadingGifElem.style.display = 'none';
    statusElem.style.display = 'inline';

    response.text()
    .then((text) => {
        statusElem.textContent = text;
    })
    .catch((error) => {
        statusElem.textContent = 'connection timed out'; 
    });
}



async function fetchAndDisplay(tableName) {
    const response = await fetch(tableName, { method: 'GET' });
    const responseData = await response.json();

    const tableContent = responseData.data;
    const columns = responseData.columns;

    const tableHead = document.getElementById("previewTableHead");
    const tableBody = document.getElementById("previewTableBody");
    const tableTitle = document.getElementById("tableTitle");

    tableHead.innerHTML = "";
    tableBody.innerHTML = "";

    tableTitle.textContent = `View ${tableName}`;

    const headerRow = document.createElement("tr");

    columns.forEach(column => {
        const th = document.createElement("th");
        th.textContent = column;
        headerRow.appendChild(th);
    });

    tableHead.appendChild(headerRow);

    // Create rows
    tableContent.forEach(row => {
        const tableRow = document.createElement("tr");

        row.forEach(field => {
            const cell = document.createElement("td");
            cell.textContent = field;
            tableRow.appendChild(cell);
        });

        tableBody.appendChild(tableRow);
    });
}


function updateTable(data, tableName) {
    const tableHead = document.getElementById("previewTableHead");
    const tableBody = document.getElementById("previewTableBody");
    const tableTitle = document.getElementById("tableTitle");

    tableHead.innerHTML = "";
    tableBody.innerHTML = "";

    if (data.length === 0) {
        tableTitle.textContent = tableName;
        return;
    }

    // Update title
    tableTitle.textContent = `View ${tableName}`;

    // Get column names
    const columns = Object.keys(data[0]);

    // Create header row
    const headerRow = document.createElement("tr");

    columns.forEach(column => {
        const th = document.createElement("th");
        th.textContent = column;
        headerRow.appendChild(th);
    });

    tableHead.appendChild(headerRow);

    // Create table rows
    data.forEach(row => {
        const tr = document.createElement("tr");

        columns.forEach(column => {
            const td = document.createElement("td");
            td.textContent = row[column];
            tr.appendChild(td);
        });

        tableBody.appendChild(tr);
    });
}



function setupDropdown() {
    const dropdown = document.getElementById("previewTables");
    dropdown.addEventListener("change", function() {
        const selected = dropdown.value;
        switch(this.value) {
            case "gardens": 
                fetchAndDisplay("gardenTable", "gardens");
                break
            case "gardeners":
                fetchAndDisplay("gardenerTable", "gardeners");
                break
            case "seasons":
                fetchAndDisplay("seasonTable", "seasons");
                break
            case "plantSpecies":
                fetchAndDisplay("plantSpeciesTable", "plant_species");
                break
            case "spendingCategory":
                fetchAndDisplay("spendingCategoryTable", "spending_categories");
                break
            case "budgetPlan":
                fetchAndDisplay("budgetPlanTable", "budget_plans");
                break
            case "lesson":
                fetchAndDisplay("lessonTable", "lessons");
                break
            case "currency":
                fetchAndDisplay("currencyTable", "currencies");
                break
            case "transaction":
                fetchAndDisplay("transactionTable", "transactions");
                break
            case "expense":
                fetchAndDisplay("expenseTable", "expenses");
                break
            case "income":
                fetchAndDisplay("incomeTable", "incomes");
                break
            case "dailySummary":
                fetchAndDisplay("dailySummaryTable", "daily_summaries");
                break
            case "containsPlant":
                fetchAndDisplay("containsPlantTable", "contains_plant");
                break
            case "completesLesson":
                fetchAndDisplay("completesLessonTable", "completes_lesson");
                break
            case "follows":
                fetchAndDisplay("followsTable", "follows");
                break

        }

    })
}

async function resetDatabase() {
    const response = await fetch("/initiate-db", { method: 'POST' });
    const responseData = await response.json();

    if (responseData.success) {
        const messageElement = document.getElementById('resetResultMsg');
        messageElement.textContent = "Greenhouse database initiated successfully!";
        fetchAndDisplayAllTables();
    } else {
        alert("Error initiating database!");
    }
}



window.onload = function() {
    
    checkDbConnection();
    setupDropdown();
    document.getElementById("resetDBButton").addEventListener("click", resetDatabase);
};