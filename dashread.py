from plc import connect_plc
from snap7.util import get_real, get_int, set_int

def fetch_plc_data():
    plc = connect_plc()
    if plc:
        try:
            db_number = 1000  
            start_address = 0
            size = 28  

            raw_data = plc.db_read(db_number, start_address, size)
            print(f"✅ Data Read from PLC: {raw_data}")

            communicate = get_int(raw_data, 0)
            availability = get_real(raw_data, 2)
            performance = get_real(raw_data, 6)
            quality = get_real(raw_data, 10)
            produced = get_int(raw_data, 14)
            progress = get_int(raw_data, 16)
            rejorquar = get_int(raw_data, 18)
            op10status = get_int(raw_data, 20)
            op20status = get_int(raw_data, 22)
            op30status = get_int(raw_data, 24)
            op40status = get_int(raw_data, 26)

            plc.disconnect()

            oee = (availability * performance * quality) / 10000
            total = (produced + progress + rejorquar)

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
                "op10status": op10status,
                "op20status": op20status,
                "op30status": op30status,
                "op40status": op40status,
                "plc_status": True
            }
        except Exception as e:
            print(f"❌ Error Reading Data from PLC: {e}")
            return {"plc_status": False, "oee": 28, "produced": 0, "progress": 0, "rejorquar": 0, "total": 0, "availability": 50, "performance": 70, "quality": 80}
    else:
        print("❌ PLC Not Connected")
        return {"plc_status": False, "oee": 28, "produced": 0, "progress": 0, "rejorquar": 0, "total": 0, "availability": 50, "performance": 70, "quality": 80}