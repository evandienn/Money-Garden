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


function setupDropdown() {
    const dropdown = document.getElementById("previewTables");
    dropdown.addEventListener("change", function() {
        const selected = dropdown.value;
        console.log("selected:", this.value);   // confirms the handler fires

        switch(this.value) {
            case "gardens":
                fetchAndDisplay("gardens");
                break
            case "gardeners":
                fetchAndDisplay("gardeners");
                break
            case "seasons":
                fetchAndDisplay("seasons");
                break
            case "plantSpecies":
                fetchAndDisplay("plant_species");
                break
            case "spendingCategory":
                fetchAndDisplay("spending_categories");
                break
            case "budgetPlan":
                fetchAndDisplay("budget_plans");
                break
            case "lesson":
                fetchAndDisplay("lessons");
                break
            case "currency":
                fetchAndDisplay("currencies");
                break
            case "transaction":
                fetchAndDisplay("transactions");
                break
            case "expense":
                fetchAndDisplay("expenses");
                break
            case "income":
                fetchAndDisplay("incomes");
                break
            case "dailySummary":
                fetchAndDisplay("daily_summaries");
                break
            case "containsPlant":
                fetchAndDisplay("contains_plant");
                break
            case "completesLesson":
                fetchAndDisplay("completes_lesson");
                break
            case "follows":
                fetchAndDisplay("follows");
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

        const dropdown = document.getElementById("previewTables");
        if (dropdown.value) {
            dropdown.dispatchEvent(new Event("change"));
        }
    } else {
        alert("Error initiating database!");
    }
}



window.onload = function() {
    console.log("loaded",-1)
    checkDbConnection();
    setupDropdown();
    document.getElementById("resetDemotable").addEventListener("click", resetDatabase);
};