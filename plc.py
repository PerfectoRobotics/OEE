import snap7
import time

PLC_IP = "192.168.8.50"  
PLC_RACK = 0
PLC_SLOT = 1

def connect_plc():
    plc = snap7.client.Client()
    attempts = 3

    for attempt in range(attempts):
        try:
            plc.connect(PLC_IP, PLC_RACK, PLC_SLOT)
            if plc.get_connected():
                print("✅ Connected to PLC")
                return plc
        except Exception as e:
            print(f"Connection attempt {attempt+1} failed: {e}")
            time.sleep(2)  # Wait before retrying

    print("PLC Not Connected after multiple attempts")
    return None    
