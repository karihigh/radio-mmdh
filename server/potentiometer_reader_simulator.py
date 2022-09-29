from random import random
from time import sleep

async def read_from_potentiometer_and_send_to_socket_simulator(websocket):
    """Simulates reading values from potentiometer by generating "random" numbers in
    the range [0, 1] and sending them to the websocket.

    It is "random" because only the first number sent is actually randomly generated,
    the following ones just simulate an oscillating motion through the entire range
    (starting from the initial number).
    """
    addition_amount = 0.00125
    actual_number = random()
    addition = addition_amount
    while True:
        if actual_number + addition >= 1:
            addition = -addition_amount
        elif actual_number + addition <= 0:
            addition = addition_amount
        new_number = actual_number + addition
        await websocket.send(str(new_number))
        actual_number = new_number % 1
        sleep(0.025)
