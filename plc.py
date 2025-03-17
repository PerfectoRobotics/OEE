import snap7
from snap7.util import get_real, get_int

PLC_IP = "192.168.8.50"  
PLC_RACK = 0
PLC_SLOT = 1

def connect_plc():
    plc = snap7.client.Client()
    try:
        plc.connect(PLC_IP, PLC_RACK, PLC_SLOT)
        if plc.get_connected():
            print("✅ Connected to PLC")
            return plc
        else:
            print("❌ PLC Connection Failed")
            return None
    except Exception as e:
        print(f"❌ PLC Connection Error: {e}")
        return None
