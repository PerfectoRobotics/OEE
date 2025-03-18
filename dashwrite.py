from plc import connect_plc  # Import your existing PLC connection
from snap7.util import set_int

def write_plc_data(db_number, start_address, value):
    """Writes an integer value to the PLC at the given DB number and start address."""
    plc = connect_plc()  # Use the existing connection

    if plc:
        try:
            # Prepare data buffer (2 bytes for an integer)
            data = bytearray(2)
            set_int(data, 0, value)

            # Write to PLC
            plc.db_write(db_number, start_address, data)
            print(f"✅ Successfully wrote {value} to DB{db_number} at address {start_address}")

            return True
        except Exception as e:
            print(f"❌ Error Writing to PLC: {e}")
            return False
        finally:
            plc.disconnect()  # Ensure PLC disconnects properly
    else:
        print("❌ Failed to Connect to PLC")
        return False

# Example usage: Write 0 to "communicate" (DB1000, address 0)
if __name__ == "__main__":
    write_plc_data(1000, 0, 0)
