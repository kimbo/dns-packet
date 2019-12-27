const dnsPacket = require('..')
const dgram = require('dgram')

const socket = dgram.createSocket('udp4')

var cookie = Buffer.alloc(8)
cookie.write('11234567')

const buf = dnsPacket.encode({
  type: 'query',
  id: 123,
  flags: dnsPacket.RECURSION_DESIRED,
  questions: [{
    type: 'A',
    name: '13.a.ecs.dns-lab.org'
  }],
  additionals: [{
    type: 'OPT',
    name: '.',
    udpPayloadSize: 4096,
    flags: dnsPacket.DNSSEC_OK,
    options: [
      {
        code: 8,
        family: 1, // 1 for IPv4, 2 for IPv6
        sourcePrefixLength: 32, // used to truncate IP address
        scopePrefixLength: 0,
        ip: '1.2.3.4'
      },
      {
        code: 10,
        data: cookie
      }]
  }]
})

console.log(dnsPacket.decode(buf).additionals[0].options)


socket.on('message', message => {
  var response = dnsPacket.decode(message) // prints out a response from google dns
  console.log(response)
  console.log(response.additionals[0].options)
  socket.close()
})

socket.send(buf, 0, buf.length, 53, '128.187.82.249')
