function updateStationStatus() {
    let statusCard = document.getElementById("stationStatus");
    let statusText = document.getElementById("statusText");
    let statusIcon = document.getElementById("statusIcon");

    let statuses = [
        { text: "OP10 Auto Mode", class: "status-online", icon: "fa-wifi" },
        { text: "OP10 Manual Mode", class: "status-offline", icon: "fas fa-times-circle status-icon" },
        { text: "OP10 Faulted", class: "status-maintenance", icon: "fa-tools" },
        { text: "OP10 Starved", class: "status-idle", icon: "fa-pause-circle" },
        { text: "OP10 Starved", class: "status-idle", icon: "fa-pause-circle" },
        { text: "OP10 In-Progress", class: "status-idle", icon: "fa-pause-circle" }

    ];

    let randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    // Update UI
    statusCard.className = `station-card ${randomStatus.class}`;
    statusText.innerText = randomStatus.text;
    statusIcon.className = `fas ${randomStatus.icon} status-icon`;
}

// Simulate status update every 5 seconds
setInterval(updateStationStatus, 1000);

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
        .then(response => response.json())
        .then(data => {

            // Online & Offline status
            let plcStatusElement = document.getElementById("plcStatus");

            plcStatusElement.style.backgroundColor = "#ffffff52";
            plcStatusElement.style.padding = "10px";
            plcStatusElement.style.borderRadius = "5px";
            plcStatusElement.style.color = "White";
            if (data.plc_status) {
                plcStatusElement.innerHTML = '<i style="font-size: 25px;" class="bi bi-wifi"></i><span> PLC Online</span>';
            } else {
                plcStatusElement.innerHTML = '<i style="font-size: 25px;" class="bi bi-wifi-off"></i><span> PLC Offline</span>';
            }

             //Production data
            document.getElementById("total").innerText = data.total;
            document.getElementById("produced").innerText = data.produced;
            document.getElementById("progress").innerText = data.progress;  
            document.getElementById("rejctorquar").innerText = data.rejorquar;

            updateProgressCircles(data.availability, data.performance, data.quality, data.oee, data.mstat);
        })
        .catch(error => console.error("Error fetching data:", error));
}

function updateProgressCircles(avail, perf, qual, oee) {
    availabilityBar.animate(avail / 100);
    performanceBar.animate(perf / 100);
    qualityBar.animate(qual / 100);
    oeeBar.animate(oee / 100);

    document.getElementById("availabilityText").innerText = avail + "%";
    document.getElementById("performanceText").innerText = perf + "%";
    document.getElementById("qualityText").innerText = qual + "%";
    document.getElementById("oeeText").innerText = oee + "%";
}

function toggleTheme() {
    document.body.classList.toggle("dark-mode");
    let themeIcon = document.getElementById("themeIcon");
    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
        themeIcon.classList.replace("fa-moon", "fa-sun");
    } else {
        localStorage.setItem("theme", "light");
        themeIcon.classList.replace("fa-sun", "fa-moon");
    }
}

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    document.getElementById("themeIcon").classList.replace("fa-moon", "fa-sun");
}

initializeProgressCircles();
fetchOEEData();
setInterval(fetchOEEData, 1000);