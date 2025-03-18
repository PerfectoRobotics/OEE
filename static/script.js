function updateStationStatus(plcValue) {
    let statusCard = document.getElementById("stationStatus");
    let statusText = document.getElementById("statusText");
    let statusIcon = document.getElementById("statusIcon");

    // Define the status mapping based on PLC values
    let statuses = [
        { value: 1, text: "OP10 Auto Mode", class: "status-online", icon: "fa-wifi" },
        { value: 2, text: "OP10 Manual Mode", class: "status-offline", icon: "fa-times-circle" },
        { value: 3, text: "OP10 Faulted", class: "status-maintenance", icon: "fa-tools" },
        { value: 4, text: "OP10 Starved", class: "status-idle", icon: "fa-pause-circle" },
        { value: 5, text: "OP10 In-Progress", class: "status-inprogress", icon: "fa-play-circle" }
    ];

    // Find the status based on PLC value
    let selectedStatus = statuses.find(status => status.value === plcValue);

    if (selectedStatus) {
        // Update UI if a valid PLC value is passed
        statusCard.classList.remove(...statusCard.classList);
        statusCard.classList.add("station-card", selectedStatus.class);

        statusText.innerText = selectedStatus.text;
        statusIcon.className = `fas ${selectedStatus.icon} status-icon`;
    } else {
        console.error("Invalid PLC value");
    }
}


// Simulate status update every 5 seconds
setInterval(updateStationStatus, 5000);

let availabilityBar, performanceBar, qualityBar, oeeBar;

function initializeProgressCircles() {
    availabilityBar = new ProgressBar.Circle("#availabilityCircle", {
        strokeWidth: 10,
        color: "#28a745",
        trailColor: "#e0e0e0",
        trailWidth: 14
    });

    performanceBar = new ProgressBar.Circle("#performanceCircle", {
        strokeWidth: 10,
        color: "#ffc107",
        trailColor: "#e0e0e0",
        trailWidth: 14
    });

    qualityBar = new ProgressBar.Circle("#qualityCircle", {
        strokeWidth: 10,
        color: "#17a2b8",
        trailColor: "#e0e0e0",
        trailWidth: 14
    });

    oeeBar = new ProgressBar.Circle("#oeeCircle", {
        strokeWidth: 10,
        color: "#007bff",
        trailColor: "#e0e0e0",
        trailWidth: 14
    });
}

function fetchOEEData() {
    fetch("/get_oee_data")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP Error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            let plcStatusElement = document.getElementById("plcStatus");

            plcStatusElement.style.cssText = `
                background-color: #ffffff52;
                padding: 10px;
                border-radius: 5px;
                color: white;
            `;

            plcStatusElement.innerHTML = data.plc_status
                ? '<i style="font-size: 25px;" class="bi bi-wifi"></i><span> PLC Online</span>'
                : '<i style="font-size: 25px;" class="bi bi-wifi-off"></i><span> PLC Offline</span>';

            // Update production data
            document.getElementById("total").innerText = data.total || "N/A";
            document.getElementById("produced").innerText = data.produced || "N/A";
            document.getElementById("progress").innerText = data.progress || "N/A";
            document.getElementById("rejctorquar").innerText = data.rejorquar || "N/A";

            updateProgressCircles(data.availability, data.performance, data.quality, data.oee);
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            document.getElementById("plcStatus").innerHTML = `<span style="color: red;">Error: Unable to fetch data</span>`;
        });
}

function updateProgressCircles(avail = 0, perf = 0, qual = 0, oee = 0) {
    availabilityBar.animate(avail / 100);
    performanceBar.animate(perf / 100);
    qualityBar.animate(qual / 100);
    oeeBar.animate(oee / 100);

    document.getElementById("availabilityText").innerText = `${avail}%`;
    document.getElementById("performanceText").innerText = `${perf}%`;
    document.getElementById("qualityText").innerText = `${qual}%`;
    document.getElementById("oeeText").innerText = `${oee}%`;
}

function toggleTheme() {
    let body = document.body;
    let themeIcon = document.getElementById("themeIcon");
    let isDark = body.classList.toggle("dark-mode");

    localStorage.setItem("theme", isDark ? "dark" : "light");
    themeIcon.className = `fa ${isDark ? "fa-sun" : "fa-moon"}`;
}

// Set theme on page load
document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
        document.getElementById("themeIcon").className = "fa fa-sun";
    }
});

initializeProgressCircles();
fetchOEEData();
setInterval(fetchOEEData, 3500);
