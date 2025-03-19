from plc import connect_plc
from snap7.util import get_real, get_int

def fetch_plc_data():
    plc = connect_plc()
    if not plc or not plc.get_connected():
        print("❌ PLC Not Connected")
        return {"plc_status": False}

    try:
        db_number = 1000  
        start_address = 0
        size = 28  

        raw_data = plc.db_read(db_number, start_address, size)
        print(f"✅ Data Read from PLC: {raw_data}")

        if not raw_data:
            print("❌ No Data Received from PLC")
            return {"plc_status": False}

        communicate = get_int(raw_data, 0)
        availability = get_real(raw_data, 2)
        performance = get_real(raw_data, 6)
        quality = get_real(raw_data, 10)
        produced = get_int(raw_data, 14)
        progress = get_int(raw_data, 16)
        rejorquar = get_int(raw_data, 18)
        op10_status = get_int(raw_data, 20)  # Fixed variable name
        op20_status = get_int(raw_data, 22)  
        op30a_status = get_int(raw_data, 24)  
        op30b_status = get_int(raw_data, 26)  

        plc.disconnect()

        oee = (availability * performance * quality) / 10000
        total = produced + progress + rejorquar

        return {
            "communicate": communicate,
            "availability": round(availability, 2),
            "performance": round(performance, 2),
            "quality": round(quality, 2),
            "oee": round(oee, 2),
            "produced": produced,
            "progress": progress,
            "rejorquar": rejorquar,
            "total": total,
            "op10_status": op10_status,
            "op20_status": op20_status,
            "op30a_status": op30a_status,
            "op30b_status": op30b_status,
            "plc_status": True
        }
    except Exception as e:
        print(f"❌ Error Reading Data from PLC: {e}")
        return {"plc_status": False}
