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

async function fetchAndDisplayGardeners() {
    const tableElement = document.getElementById('gardenerTable');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/gardeners', { method: 'GET' });
    const responseData = await response.json();
    const tableContent = responseData.data;

    if (tableBody) {
        tableBody.innerHTML = '';
    }

    tableContent.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            // Format dates slightly nicer if it's the join_date column
            cell.textContent = index === 3 ? new Date(field).toLocaleDateString() : field;
        });
    });
}

async function resetDatabase() {
    const response = await fetch("/initiate-db", { method: 'POST' });
    const responseData = await response.json();

    if (responseData.success) {
        const messageElement = document.getElementById('resetResultMsg');
        messageElement.textContent = "Greenhouse database initiated successfully!";
        fetchAndDisplayGardeners();
    } else {
        alert("Error initiating database!");
    }
}

window.onload = function() {
    checkDbConnection();
    fetchAndDisplayGardeners();
    document.getElementById("resetDBButton").addEventListener("click", resetDatabase);
};