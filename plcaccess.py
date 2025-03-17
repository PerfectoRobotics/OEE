from plc import connect_plc
from snap7.util import get_real, get_int

def fetch_plc_data():
    plc = connect_plc()
    if plc:
        try:
            db_number = 1000  
            start_address = 0
            size = 18  

            raw_data = plc.db_read(db_number, start_address, size)
            print(f"✅ Data Read from PLC: {raw_data}")

            availability = get_real(raw_data, 0)
            performance = get_real(raw_data, 4)
            quality = get_real(raw_data, 8)
            produced = get_int(raw_data, 12)
            progress = get_int(raw_data, 14)
            rejorquar = get_int(raw_data, 16)

            plc.disconnect()

            oee = (availability * performance * quality) / 10000
            total = (produced + progress + rejorquar)

            return {
                "availability": round(availability, 2),
                "performance": round(performance, 2),
                "quality": round(quality, 2),
                "oee": round(oee, 2),
                "produced": produced,
                "progress": progress,
                "rejorquar": rejorquar,
                "total": total,
                "plc_status": True
            }
        except Exception as e:
            print(f"❌ Error Reading Data from PLC: {e}")
            return {"plc_status": False, "oee": 0, "produced": 0, "progress": 0, "rejorquar": 0, "total": 0}
    else:
        print("❌ PLC Not Connected")
        return {"plc_status": False, "oee": 0, "produced": 0, "progress": 0, "rejorquar": 0, "total": 0}
