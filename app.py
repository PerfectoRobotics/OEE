from flask import Flask, render_template, jsonify
import snap7
from snap7.util import get_real, get_int

import pyodbc  # Add the missing import for pyodbc
import random

app = Flask(__name__)

PLC_IP = "192.168.8.50"  # Change this to your PLC's IP
PLC_RACK = 0
PLC_SLOT = 1

def connect_plc():
    plc = snap7.client.Client()
    try:
        plc.connect(PLC_IP, PLC_RACK, PLC_SLOT)
        if plc.get_connected():
            print("✅ Flask Connected to PLC")
            return plc
        else:
            print("❌ Flask PLC Connection Failed")
            return None
    except Exception as e:
        print(f"❌ Error Connecting to PLC: {e}")
        return None

# Database connection setup
DB_CONFIG = {
    "server": "perfecto-database.chec8y42exq5.ap-south-1.rds.amazonaws.com",
    "database": "PerfectoDL",
    "username": "admin",
    "password": "MasterPerfectoRobo"
}

def get_db_connection():
    try:
        conn = pyodbc.connect(
            f"DRIVER={{SQL Server}};"
            f"SERVER={DB_CONFIG['server']};"
            f"DATABASE={DB_CONFIG['database']};"
            f"UID={DB_CONFIG['username']};"
            f"PWD={DB_CONFIG['password']}"
        )
        return conn
    except pyodbc.Error as e:
        print(f"❌ Database connection error: {e}")
        return None

def read_oee_data():
    plc = connect_plc()
    if plc:
        try:
            db_number = 1000   # Confirm this is the correct DB number
            start_address = 0
            size = 20  # Ensure this matches your DB structure
            
            # Read raw data from PLC
            raw_data = plc.db_read(db_number, start_address, size)
            print(f"✅ Data Read from PLC: {raw_data}")

            # Extract values from raw_data
            availability = get_real(raw_data, 0)
            performance = get_real(raw_data, 4)
            quality = get_real(raw_data, 8)
            mstat = get_int(raw_data, 12)
            produced = get_int(raw_data, 14)
            progress = get_int(raw_data, 16)
            rejorquar = get_int(raw_data, 18)

            # Disconnect the PLC after reading
            plc.disconnect()

            # Calculate OEE and total values
            oee = (availability * performance * quality) / 10000
            total = (produced + progress + rejorquar)

            return {
                "availability": round(availability, 2),
                "performance": round(performance, 2),
                "quality": round(quality, 2),
                "oee": round(oee, 2),
                "mstat": mstat,  # Now correctly extracted as an integer
                "produced": produced,
                "progress": progress,
                "rejorquar": rejorquar,
                "total": total,
                "plc_status": True
            }
        except Exception as e:
            print(f"❌ Error Reading Data from PLC: {e}")
            return {
                "availability": 90, "performance": 95, "quality": 95, "oee": 85, "mstat": 0, "plc_status": False
            }
    else:
        print("❌ PLC Not Connected")
        return {
            "availability": 90, "performance": 70, "quality": 95, "oee": 85, "mstat": 0, "plc_status": False,
            "produced": 0,
                "progress": 0,
                "rejorquar": 0,
                "total": 0,
        }

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/get_oee_data")
def get_oee_data():
    return jsonify(read_oee_data())

if __name__ == "__main__":
    app.run(debug=True)
