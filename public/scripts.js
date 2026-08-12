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

// Tab Switching Logic for the Frontend UI

function switchTab(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    // Remove active state from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(tabId).classList.add('active');
    
    // Highlight the clicked button
    const activeBtn = Array.from(document.querySelectorAll('.tab-btn')).find(btn => 
        btn.getAttribute('onclick').includes(tabId)
    );
    if (activeBtn) activeBtn.classList.add('active');
}

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


// Single master table used to display any tabular result on the page,
// whether that's a raw table preview or a Milestone 4 query result.
function renderResultsTable(title, columns, rows) {
    const tableHead = document.getElementById("previewTableHead");
    const tableBody = document.getElementById("previewTableBody");
    const tableTitle = document.getElementById("tableTitle");

    tableHead.innerHTML = "";
    tableBody.innerHTML = "";
    tableTitle.textContent = title;

    if (!columns || columns.length === 0) {
        return;
    }

    const headerRow = document.createElement("tr");
    columns.forEach(column => {
        const th = document.createElement("th");
        th.textContent = column;
        headerRow.appendChild(th);
    });
    tableHead.appendChild(headerRow);

    (rows || []).forEach(row => {
        const tableRow = document.createElement("tr");
        row.forEach(field => {
            const cell = document.createElement("td");
            cell.textContent = (typeof field === 'string' && field.endsWith('T00:00:00.000Z'))
                ? field.split('T')[0]
                : field;
            tableRow.appendChild(cell);
        });
        tableBody.appendChild(tableRow);
    });
}


async function fetchAndDisplay(tableName) {
    const response = await fetch(tableName, { method: 'GET' });
    const responseData = await response.json();
    renderResultsTable(`View ${tableName}`, responseData.columns, responseData.data);
}


function setupDropdown() {
    const dropdown = document.getElementById("previewTables");
    dropdown.addEventListener("change", function() {
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

// Re-fetches whatever is currently selected in the dropdown, so mutations
// (reset, insert, update, delete) can refresh the master table in place.
function refreshCurrentTable() {
    const dropdown = document.getElementById("previewTables");
    if (dropdown.value) {
        dropdown.dispatchEvent(new Event("change"));
    }
}

async function resetDatabase() {
    const response = await fetch("/initiate-db", { method: 'POST' });
    const responseData = await response.json();

    if (responseData.success) {
        const messageElement = document.getElementById('resetResultMsg');
        messageElement.textContent = "Greenhouse database initiated successfully!";
        refreshCurrentTable();
    } else {
        alert("Error initiating database!");
    }
}


// -------------------------------------------------------------
// MILESTONE 4 QUERY LOGIC
// All query results render into the same master table via renderResultsTable().
// -------------------------------------------------------------

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
        refreshCurrentTable();
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
    if (result.success) refreshCurrentTable();
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
    if (result.success) refreshCurrentTable();
}

// 4. DYNAMIC SELECTION (Search Plants)
function addConditionRow(connector) {
    const container = document.getElementById('conditionsContainer');
    const row = document.createElement('div');
    row.className = 'condition-row';
    row.style.marginBottom = '8px';
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.gap = '8px';
    
    // Visually print "AND" or "OR", but hide the actual data value for the backend
    row.innerHTML = `
        <span style="font-weight: bold; width: 40px; text-align: right; color: #555;">${connector}</span>
        <input type="hidden" class="cond-connector" value="${connector}">
        <select class="cond-field" required>
            <option value="common_name">Common Name</option>
            <option value="rarity">Rarity</option>
            <option value="days_to_mature">Days to Mature</option>
            <option value="drought_tolerance">Drought Tolerance</option>
            <option value="category_name">Category Name</option>
        </select>
        <select class="cond-operator" required>
            <option value="=">=</option>
            <option value="!=">!=</option>
            <option value="<">&lt;</option>
            <option value=">">&gt;</option>
            <option value="<=">&lt;=</option>
            <option value=">=">&gt;=</option>
        </select>
        <input type="text" class="cond-value" placeholder="Value" required>
        <button type="button" class="remove-cond-btn" style="background-color: #dc3545; padding: 6px 10px;">X</button>
    `;
    container.appendChild(row);
    
    row.querySelector('.remove-cond-btn').addEventListener('click', () => {
        row.remove();
    });
}

const addAndBtn = document.getElementById('addAndBtn');
if (addAndBtn) addAndBtn.addEventListener('click', () => addConditionRow('AND'));

const addOrBtn = document.getElementById('addOrBtn');
if (addOrBtn) addOrBtn.addEventListener('click', () => addConditionRow('OR'));

async function handleSearchPlants(e) {
    e.preventDefault();
    const rows = document.querySelectorAll('.condition-row');
    const conditions = [];
    
    rows.forEach((row, index) => {
        const field = row.querySelector('.cond-field').value;
        const operator = row.querySelector('.cond-operator').value;
        const value = row.querySelector('.cond-value').value;
        
        let connector = null;
        if (index > 0) {
            connector = row.querySelector('.cond-connector').value;
        }
        
        conditions.push({ field, operator, value, connector });
    });

    try {
        const response = await fetch('/search-plants', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conditions })
        });
        const result = await response.json();
        renderResultsTable('Filtered Plant Species', result.columns, result.data);
    } catch (err) {
        console.error("Search failed:", err);
        alert("Failed to perform search. Check the terminal for errors.");
    }
}

// 5. PROJECTION
async function handleProjection(e) {
    e.preventDefault();
    const checkedBoxes = document.querySelectorAll('input[name="projCol"]:checked');
    const columns = Array.from(checkedBoxes).map(cb => cb.value);

    if (columns.length === 0) {
        alert('Please select at least one column.');
        return;
    }
    const response = await fetch('/project-gardener', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columns })
    });
    const result = await response.json();
    renderResultsTable('Gardener Columns', result.columns, result.data);
}

// 6. JOIN
async function handleJoin(e) {
    e.preventDefault();
    const season_name = document.getElementById('joinSeason').value;
    const response = await fetch(`/join-season?season_name=${season_name}`);
    const result = await response.json();
    renderResultsTable(`Gardeners in ${season_name}`, result.columns, result.data);
}

// 7. AGGREGATION
async function handleAggregation() {
    const response = await fetch('/agg-total-spent');
    const result = await response.json();
    renderResultsTable('Total Spent by Category', result.columns, result.data);
}

// 8. HAVING
async function handleHaving(e) {
    e.preventDefault();
    const min_count = document.getElementById('havingCount').value;
    const response = await fetch(`/agg-having?min_count=${min_count}`);
    const result = await response.json();
    renderResultsTable('Categories With Many Transactions', result.columns, result.data);
}

// 9. NESTED AGGREGATION
async function handleNestedAggregation() {
    const response = await fetch('/agg-nested');
    const result = await response.json();
    renderResultsTable('Highest Average Spending Category', result.columns, result.data);
}

// 10. DIVISION
async function handleDivision() {
    const response = await fetch('/division-diligent');
    const result = await response.json();
    renderResultsTable('Diligent Gardeners (Completed All Lessons)', result.columns, result.data);
}


window.onload = function() {
    checkDbConnection();
    setupDropdown();
    document.getElementById("resetDBButton").addEventListener("click", resetDatabase);
    document.getElementById("loadGardenersButton").addEventListener("click", () => {
        document.getElementById("previewTables").value = "gardeners";
        fetchAndDisplay("gardeners");
    });

    const insertForm = document.getElementById('insertForm');
    if (insertForm) insertForm.addEventListener('submit', handleInsert);

    const updateForm = document.getElementById('updateForm');
    if (updateForm) updateForm.addEventListener('submit', handleUpdate);

    const deleteForm = document.getElementById('deleteForm');
    if (deleteForm) deleteForm.addEventListener('submit', handleDelete);

    const searchForm = document.getElementById('searchForm');
    if (searchForm) searchForm.addEventListener('submit', handleSearchPlants);

    const projectForm = document.getElementById('projectForm');
    if (projectForm) projectForm.addEventListener('submit', handleProjection);

    const joinForm = document.getElementById('joinForm');
    if (joinForm) joinForm.addEventListener('submit', handleJoin);

    const aggBtn = document.getElementById('aggBtn');
    if (aggBtn) aggBtn.addEventListener('click', handleAggregation);

    const havingForm = document.getElementById('havingForm');
    if (havingForm) havingForm.addEventListener('submit', handleHaving);

    const nestedBtn = document.getElementById('nestedBtn');
    if (nestedBtn) nestedBtn.addEventListener('click', handleNestedAggregation);

    const divisionBtn = document.getElementById('divisionBtn');
    if (divisionBtn) divisionBtn.addEventListener('click', handleDivision);
};
