import busio
import digitalio
import board
import adafruit_mcp3xxx.mcp3008 as MCP
from adafruit_mcp3xxx.analog_in import AnalogIn
from time import sleep

SECONDS_BETWEEN_READS = 0.05
POTENTIOMETER_LOWER_BOUND = 0
POTENTIOMETER_UPPER_BOUND = 65535

SMOOTHING_METHOD = "average" # the other option: "tolerance"

N_POINTS_FOR_AVERAGE = 10

CHANGE_TOLERANCE = 500

async def read_from_potentiometer_and_send_to_socket(websocket):
    """As the name implies, this function reads the signal from the potentiometer, maps
    it to the range [0, 1], and sends it to the websocket.

    Original implementation:
    https://github.com/adafruit/Adafruit_Learning_System_Guides/blob/main/Analog_Inputs_for_Raspberry_Pi_Using_the_MCP3008/code.py
    """
    def get_proportion_in_range(
        original_value,
        original_range_lower_bound,
        original_range_upper_bound,
    ):
        """Map a value in a specified range to the [0, 1] one (i.e. a proportion)"""

        range_span = original_range_upper_bound - original_range_lower_bound
        return (original_value - original_range_lower_bound) / range_span
    
    async def read_and_process_using_tolerance(websocket, chan0):
        """TODO: Missing docs"""

        last_value_read = 0

        while True:
            # Read the analog pin
            new_value = chan0.value

            change_magnitude = abs(new_value - last_value_read)

            # Only send new value if surpassed tolerance
            if change_magnitude > CHANGE_TOLERANCE:

                # Convert original value read to float in the [0, 1] range (proportion in the range)
                range_proportion = get_proportion_in_range(
                    new_value,
                    POTENTIOMETER_LOWER_BOUND,
                    POTENTIOMETER_UPPER_BOUND,
                )
                print(range_proportion)
                await websocket.send(str(range_proportion))

                # Save the potentiometer reading for the next iteration
                last_value_read = new_value

            # Avoid reading too much the potentiometer by sleeping an arbitrary amount of time
            # TODO: maybe switch to asyncio.sleep()
            print()
            sleep(SECONDS_BETWEEN_READS)
    
    async def read_and_process_using_average(websocket, chan0, initial_value):
        """TODO: Missing docs"""
        
        last_n_values_read = [initial_value for _ in range(N_POINTS_FOR_AVERAGE)]

        while True:

            for i in range(N_POINTS_FOR_AVERAGE):
                # Read the analog pin
                new_value = chan0.value
                range_proportion = get_proportion_in_range(
                    new_value,
                    POTENTIOMETER_LOWER_BOUND,
                    POTENTIOMETER_UPPER_BOUND,
                )
                last_n_values_read[i] = range_proportion
                average_proportion = sum(last_n_values_read) / N_POINTS_FOR_AVERAGE
                await websocket.send(str(average_proportion))

                # Avoid reading too much the potentiometer by sleeping an arbitrary amount of time
                # TODO: maybe switch to asyncio.sleep()
                sleep(SECONDS_BETWEEN_READS)

    # Create the SPI bus
    spi = busio.SPI(clock=board.SCK, MISO=board.MISO, MOSI=board.MOSI)

    # Create the cs (chip select)
    cs = digitalio.DigitalInOut(board.D22)

    # Create the mcp object
    mcp = MCP.MCP3008(spi, cs)

    # Create an analog input channel on pin 0
    chan0 = AnalogIn(mcp, MCP.P0)

    initial_value = chan0.value

    print("Raw ADC Value: ", initial_value)
    print("ADC Voltage: " + str(chan0.voltage) + "V")

    if SMOOTHING_METHOD == "tolerance":
        await read_and_process_using_tolerance(websocket, chan0)
    
    elif SMOOTHING_METHOD == "average":
        await read_and_process_using_average(websocket, chan0, initial_value)

