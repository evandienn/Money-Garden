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

async function fetchAndDisplay(idElementDisplay, toFetch) {
    const tableElement = document.getElementById(idElementDisplay);
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch(toFetch, { method: 'GET' });
    const responseData = await response.json();
    const tableContent = responseData.data;

    if (tableBody) {
        tableBody.innerHTML = '';
    }

    tableContent.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            
            // Safely check if the field is actually an ISO date string before formatting
            if (field && typeof field === 'string' && field.includes('T00:00:00.000Z')) {
                cell.textContent = field.split('T')[0];
            } else {
                cell.textContent = field;
            }
        });
    });
}

function fetchAndDisplayAllTables() {
    fetchAndDisplay("gardenerTable", "gardeners");
    fetchAndDisplay("seasonTable", "seasons");
    fetchAndDisplay("gardenTable", "gardens");
    fetchAndDisplay("spendingCategoryTable", "spending_categories");
    fetchAndDisplay("plantSpeciesTable", "plant_species");
    fetchAndDisplay("budgetPlanTable", "budget_plans");
    fetchAndDisplay("lessonTable", "lessons");
    fetchAndDisplay("currencyTable", "currencies");
    fetchAndDisplay("transactionTable", "transactions");
    fetchAndDisplay("expenseTable", "expenses");
    fetchAndDisplay("incomeTable", "incomes");
    fetchAndDisplay("dailySummaryTable", "daily_summaries");
    fetchAndDisplay("containsPlantTable", "contains_plant");
    fetchAndDisplay("completesLessonTable", "completes_lesson");
    fetchAndDisplay("followsTable", "follows");
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

// -------------------------------------------------------------
// NEW MILESTONE 4 QUERY LOGIC STARTING BELOW
// -------------------------------------------------------------

// --- HELPER FUNCTION TO RENDER DYNAMIC QUERY TABLES ---
function renderDynamicTable(data, containerId, headers = []) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // Clear previous

    if (!data || data.length === 0) {
        container.innerHTML = '<p>No results found.</p>';
        return;
    }

    const table = document.createElement('table');
    table.border = "1";
    
    if (headers.length > 0) {
        const thead = document.createElement('thead');
        const tr = document.createElement('tr');
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            tr.appendChild(th);
        });
        thead.appendChild(tr);
        table.appendChild(thead);
    }

    const tbody = document.createElement('tbody');
    data.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            if (typeof cell === 'string' && cell.includes('T00:00:00.000Z')) {
                td.textContent = cell.split('T')[0];
            } else {
                td.textContent = cell;
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);
}

// 1. INSERT
async function handleInsert(e) {
    e.preventDefault();
    const payload = {
        id: document.getElementById('txId').value,
        amount: document.getElementById('txAmt').value,
        date: document.getElementById('txDate').value,
        category: document.getElementById('txCategory').value,
        currency: document.getElementById('txCurrency').value
    };

    const response = await fetch('/insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    const msgBox = document.getElementById('insertResult');
    if (result.success) {
        msgBox.textContent = "Transaction successfully inserted!";
        msgBox.style.color = "green";
        fetchAndDisplayAllTables(); // Refresh standard tables
    } else {
        msgBox.textContent = "Error: Invalid input or ID already exists.";
        msgBox.style.color = "red";
    }
}

// 2. UPDATE
async function handleUpdate(e) {
    e.preventDefault();
    const payload = {
        plan_id: document.getElementById('updPlanId').value,
        new_cap: document.getElementById('updCap').value,
        new_rule: document.getElementById('updRule').value
    };

    const response = await fetch('/update-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    const msgBox = document.getElementById('updateResult');
    msgBox.textContent = result.success ? "Budget Plan updated!" : "Update failed. Does the ID exist?";
    msgBox.style.color = result.success ? "green" : "red";
    if(result.success) fetchAndDisplayAllTables();
}

// 3. DELETE
async function handleDelete(e) {
    e.preventDefault();
    const payload = { transaction_id: document.getElementById('delTxId').value };

    const response = await fetch('/delete-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    const msgBox = document.getElementById('deleteResult');
    msgBox.textContent = result.success ? "Transaction deleted (Cascade applied)!" : "Delete failed. ID not found.";
    msgBox.style.color = result.success ? "green" : "red";
    if(result.success) fetchAndDisplayAllTables();
}

// 4. SELECTION
async function handleSelection(e) {
    e.preventDefault();
    const max_days = document.getElementById('selMaxDays').value;
    const rarity = document.getElementById('selRarity').value;
    const response = await fetch(`/filter-plants?max_days=${max_days}&rarity=${rarity}`);
    const result = await response.json();
    renderDynamicTable(result.data, 'selectResult', ['Common Name', 'Rarity', 'Days to Mature', 'Drought Tolerance', 'Category']);
}

// 5. PROJECTION
async function handleProjection(e) {
    e.preventDefault();
    const checkedBoxes = document.querySelectorAll('input[name="projCol"]:checked');
    const columns = Array.from(checkedBoxes).map(cb => cb.value);

    if (columns.length === 0) {
        document.getElementById('projectResult').innerHTML = '<p style="color:red">Please select at least one column.</p>';
        return;
    }
    const response = await fetch('/project-gardener', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columns })
    });
    const result = await response.json();
    renderDynamicTable(result.data, 'projectResult', columns);
}

// 6. JOIN
async function handleJoin(e) {
    e.preventDefault();
    const season_name = document.getElementById('joinSeason').value;
    const response = await fetch(`/join-season?season_name=${season_name}`);
    const result = await response.json();
    renderDynamicTable(result.data, 'joinResult', ['Gardener Name', 'Garden Theme', 'Season Rule']);
}

// 7. AGGREGATION
async function handleAggregation() {
    const response = await fetch('/agg-total-spent');
    const result = await response.json();
    renderDynamicTable(result.data, 'aggResult', ['Category', 'Total Spent']);
}

// 8. HAVING
async function handleHaving(e) {
    e.preventDefault();
    const min_count = document.getElementById('havingCount').value;
    const response = await fetch(`/agg-having?min_count=${min_count}`);
    const result = await response.json();
    renderDynamicTable(result.data, 'havingResult', ['Category', 'Transaction Count']);
}

// 9. NESTED AGGREGATION
async function handleNestedAggregation() {
    const response = await fetch('/agg-nested');
    const result = await response.json();
    renderDynamicTable(result.data, 'nestedResult', ['Category', 'Highest Average Amount']);
}

// 10. DIVISION
async function handleDivision() {
    const response = await fetch('/division-diligent');
    const result = await response.json();
    renderDynamicTable(result.data, 'divisionResult', ['Diligent Gardeners (Completed All Lessons)']);
}


// --- WINDOW ONLOAD OVERRIDE ---
window.onload = function() {
    checkDbConnection();
    fetchAndDisplayAllTables();
    document.getElementById("resetDBButton").addEventListener("click", resetDatabase);
    document.getElementById("loadGardenersButton").addEventListener("click", fetchAndDisplayAllTables);
    
    // Bind new query buttons (ensure these IDs exist in your index.html)
    const insertForm = document.getElementById('insertForm');
    if(insertForm) insertForm.addEventListener('submit', handleInsert);

    const updateForm = document.getElementById('updateForm');
    if(updateForm) updateForm.addEventListener('submit', handleUpdate);

    const deleteForm = document.getElementById('deleteForm');
    if(deleteForm) deleteForm.addEventListener('submit', handleDelete);

    const selectForm = document.getElementById('selectForm');
    if(selectForm) selectForm.addEventListener('submit', handleSelection);

    const projectForm = document.getElementById('projectForm');
    if(projectForm) projectForm.addEventListener('submit', handleProjection);

    const joinForm = document.getElementById('joinForm');
    if(joinForm) joinForm.addEventListener('submit', handleJoin);

    const aggBtn = document.getElementById('aggBtn');
    if(aggBtn) aggBtn.addEventListener('click', handleAggregation);

    const havingForm = document.getElementById('havingForm');
    if(havingForm) havingForm.addEventListener('submit', handleHaving);

    const nestedBtn = document.getElementById('nestedBtn');
    if(nestedBtn) nestedBtn.addEventListener('click', handleNestedAggregation);

    const divisionBtn = document.getElementById('divisionBtn');
    if(divisionBtn) divisionBtn.addEventListener('click', handleDivision);
};