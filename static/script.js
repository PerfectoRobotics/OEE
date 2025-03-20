document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded!");

    initializeProgressCircles();
    fetchAndUpdatePLCData();
    fetchOEEData();

    setInterval(fetchOEEData, 3500);
    setInterval(fetchAndUpdatePLCData, 5000);

    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
        document.getElementById("themeIcon").className = "fa fa-sun";
    }

    let showPasswordToggle = document.getElementById("showPassword");
    if (showPasswordToggle) {
        showPasswordToggle.addEventListener("change", function () {
            let passwordField = document.getElementById("password");
            if (passwordField) {
                passwordField.type = this.checked ? "text" : "password";
            }
        });
    }

    let progress = document.querySelector("#progress-bar .progress");
    if (progress) {
        let width = 0;
        let interval = setInterval(() => {
            if (width >= 100) {
                clearInterval(interval);
                document.getElementById("progress-bar").style.display = "none";
            } else {
                width += 10;
                progress.style.width = width + "%";
            }
        }, 200);
    }
});

function fetchAndUpdatePLCData() {
    fetch("/get_oee_data")
        .then(response => response.json())
        .then(data => {
            console.log("📡 Received PLC Data:", data);

            if (data.plc_status) {
                updateStationStatus(data.op10status);
            } else {
                console.warn("⚠️ PLC is Offline");
            }
        })
}

function fetchOEEData() {
    fetch("/get_oee_data")
        .then(response => response.json())
        .then(data => {
            let plcStatusElement = document.getElementById("plcStatus");
            if (!plcStatusElement) {
                console.warn("⚠️ plcStatus element not found in DOM.");
                return;
            }

            plcStatusElement.innerHTML = data.plc_status
                ? '<i style="font-size: 25px;" class="bi bi-wifi danger"></i><span> M/C Online</span>'
                : '<i style="font-size: 25px;" class="bi bi-wifi-off"></i><span> M/C Offline</span>';

            ["total", "produced", "progress", "rejctorquar"].forEach(id => {
                let el = document.getElementById(id);
                if (el) el.innerText = data[id] || "0";
            });

            updateProgressCircles(data.availability, data.performance, data.quality, data.oee);
        })
}

function updateProgressCircles(avail = 0, perf = 0, qual = 0, oee = 0) {
    if (!availabilityBar || !performanceBar || !qualityBar || !oeeBar) {
        console.warn("⚠️ Progress bars are not initialized!");
        return;
    }

    availabilityBar.animate(avail / 100);
    performanceBar.animate(perf / 100);
    qualityBar.animate(qual / 100);
    oeeBar.animate(oee / 100);

    ["availabilityText", "performanceText", "qualityText", "oeeText"].forEach((id, index) => {
        let element = document.getElementById(id);
        if (element) {
            let values = [avail, perf, qual, oee];
            element.innerText = `${values[index]}%`;
        }
    });
}


document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded!");

    async function fetchAndUpdatePLCData() {
        try {
            const response = await fetch("/api/plc-data");  // Ensure this API returns valid JSON
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log("📡 Received PLC Data:", data);

            if (!data || Object.keys(data).length === 0) {
                console.error("No data received for updating station status.");
                return;
            }

            updateStationStatus(data);
        } catch (error) {
            console.error("Error fetching PLC data:", error);
        }
    }

    function updateStationStatus(data) {
        console.log("🔍 Debug: PLC Status Data:", data);

        if (!data || typeof data !== "object") {
            console.error("Invalid or missing data for station status update.");
            return;
        }

        const statusElements = {
            op10: document.getElementById("op10-status"),
            op20: document.getElementById("op20-status"),
            op30a: document.getElementById("op30a-status"),
            op30b: document.getElementById("op30b-status"),
        };

        const statuses = {
            1: { text: "Auto Mode", class: "status-online", icon: "fa-gear" },
            2: { text: "Manual Mode", class: "status-maintenance", icon: "fa-tools" },
            3: { text: "Faulted", class: "status-offline", icon: "fa-times-circle" },
            4: { text: "Halt", class: "status-idle", icon: "fa-pause-circle" },
            5: { text: "In-Progress", class: "status-inprogress", icon: "fa-play-circle" },
            6: { text: "Starved", class: "status-idle", icon: "fa-play-circle" }
        };

        for (let key in statusElements) {
            if (!statusElements[key]) {
                console.warn(`⚠️ Missing DOM element for ${key}`);
                continue;
            }

            const statusCode = data[`${key}_status`]; // Ensure key matches API response
            if (statusCode === undefined) {
                console.warn(`⚠️ No status code found for ${key}`);
                continue;
            }

            const selectedStatus = statuses[statusCode] || { text: "Unknown", class: "status-unknown", icon: "fa-exclamation-triangle" };

            statusElements[key].className = `station-card ${selectedStatus.class}`;
            statusElements[key].querySelector("i").className = `fas ${selectedStatus.icon} status-icon`;
            statusElements[key].querySelector("p").textContent = `${key.toUpperCase()} ${selectedStatus.text}`;
        }
    }
    console.log("✅ fetchAndUpdatePLCData() is running...");

    setInterval(fetchAndUpdatePLCData, 1000);
});

function toggleTheme() {
    let body = document.body;
    let themeIcon = document.getElementById("themeIcon");
    let isDark = body.classList.toggle("dark-mode");

    localStorage.setItem("theme", isDark ? "dark" : "light");
    themeIcon.className = `fa ${isDark ? "fa-sun" : "fa-moon"}`;
}

let availabilityBar, performanceBar, qualityBar, oeeBar;

function initializeProgressCircles() {
    let elements = ["availabilityCircle", "performanceCircle", "qualityCircle", "oeeCircle"];
    let colors = ["#28a745", "#ffc107", "#17a2b8", "#007bff"];

    [availabilityBar, performanceBar, qualityBar, oeeBar] = elements.map((id, index) => {
        let el = document.getElementById(id);
        return el ? new ProgressBar.Circle(el, { strokeWidth: 10, color: colors[index], trailColor: "#e0e0e0", trailWidth: 14 }) : null;
    });
}