import asyncio

from websockets import serve

from potentiometer_reader import read_from_potentiometer_and_send_to_socket
# from potentiometer_reader_simulator import read_from_potentiometer_and_send_to_socket_simulator

async def main():
    async with serve(read_from_potentiometer_and_send_to_socket, "localhost", 8765):
        await asyncio.Future()  # run forever

asyncio.run(main())
