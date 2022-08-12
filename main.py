import network
import socket
import time
from neopixel import Neopixel

from params import params

led = machine.Pin('LED', machine.Pin.OUT)
pixels = Neopixel(params['numberOfPixels'], 0, 28, "GRB")
pixels.brightness(params['brightness'])
wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect(params['ssid'], params['password'])

# Wait for connect or fail
max_wait = 10
while max_wait > 0:
    if wlan.status() < 0 or wlan.status() >= 3:
        break
    max_wait -= 1
    print('waiting for connection...')
    time.sleep(2)

# Handle connection error
if wlan.status() != 3:
    raise RuntimeError('network connection failed')
else:
    print('connected')
    status = wlan.ifconfig()
    print('ip = ' + status[0])

# Open socket
addr = socket.getaddrinfo('0.0.0.0', params['port'])[0][-1]

s = socket.socket()
s.bind(addr)
s.listen(1)

print('listening on', addr[0])

# Listen for connections
while True:
    try:
        cl, addr = s.accept()
        print('client address', addr[0])

        request = cl.recv(1024)

        request = str(request)

        led_on = request.find('led_on')
        led_off = request.find('led_off')

        print('led_on', led_on)
        print('led_off', led_off)

        cl.send('HTTP/1.0 200 OK\r\nContent-type: text/plain\r\n\r\n')

        if led_on != -1:
            led.value(1)
            pixels.fill(params['onColor'])
            pixels.show()
            cl.send('led_on')

        if led_off != -1:
            led.value(0)
            pixels.fill(params['offColor'])
            pixels.show()
            cl.send('led_off')

        cl.close()

    except OSError as e:
        cl.close()
        print('connection closed')
