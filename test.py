import snap7

PLC_IP = "192.168.8.50"
PLC_RACK = 0
PLC_SLOT = 1

plc = snap7.client.Client()
try:
    plc.connect(PLC_IP, PLC_RACK, PLC_SLOT)
    
    if plc.get_connected():
        print("✅ PLC Connected Successfully")
        print("CPU State:", plc.get_cpu_state())
    else:
        print("❌ PLC Connection Failed")

    plc.disconnect()

except Exception as e:
    print(f"❌ Error: {e}")
