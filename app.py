from flask import Flask, render_template, jsonify
import snap7
from snap7.util import get_real
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
            print("Flask PLC Connection Failed")
            return None
    except Exception as e:
        print(f"Error Connecting to PLC: {e}")
        return None


def read_oee_data():
    plc = connect_plc()
    if plc:
        try:
            db_number = 1   # Confirm this is the correct DB number
            start_address = 0
            size = 12  # Ensure this matches your DB structure
            
            raw_data = plc.db_read(db_number, start_address, size)
            print(f"✅ Data Read from PLC: {raw_data}")

            availability = get_real(raw_data, 0)
            performance = get_real(raw_data, 4)
            quality = get_real(raw_data, 8)
            
            plc.disconnect()

            oee = (availability * performance * quality) / 10000
            return {
                "availability": round(availability, 2),
                "performance": round(performance, 2),
                "quality": round(quality, 2),
                "oee": round(oee, 2),
                "plc_status": True
            }
        except Exception as e:
            print(f"❌ Error Reading Data from PLC: {e}")
            return {"availability": 0, "performance": 0, "quality": 0, "oee": 0, "plc_status": False}
    else:
        print("❌ PLC Not Connected")
        return {"availability": 0, "performance": 0, "quality": 0, "oee": 0, "plc_status": False}


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/get_oee_data")
def get_oee_data():
    return jsonify(read_oee_data())

if __name__ == "__main__":
    app.run(debug=True)
