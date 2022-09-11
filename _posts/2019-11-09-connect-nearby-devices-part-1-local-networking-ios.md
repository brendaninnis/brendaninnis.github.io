---
layout: post
title: "Connect Nearby Devices Part 1: Local Networking iOS"
description: "Learn to build an iOS app that connects nearby devices over a local network."
permalink: /connect-nearby-devices-part-1.html
categories:
  - Mobile
tags:
  - iOS
  - Swift
  - Networking
  - Nearby Devices
---

Want to create an app that connects to nearby devices running the same app and is able to share data without going over the internet? So did I, but I had a hard time finding a good source of information online to teach me how to do that. In this series I'm going to explain how to create an app that can connect many devices running iOS or Android and share data between them.

The first part of this seriers will teach you to build an iOS app that can connect to other devices over a Local Area Network. Further parts of this series will cover Android as well as using Bluetooth as an alternative strategy to connect nearby devices.

## Example Local Networking App

I built an iOS app that can join a realtime messaging chat with any other devices on the same local network. The first person who joins the chat will become the host and other people running the app that join the chat will be connected to the host. Everyone will be assinged a random name after a character from the Belgariad. You can follow along with this tutorial and build you own app, or you can also download the repository of the finished app here: [Finished Example](https://github.com/brendaninnis/LocalNetworkingApp). 

## Connecting devices over a local network

There are 2 parts to building this app, discovery and connection. 

Discovery means we need devices running the same app to be able to see each other so that they can connect. For discovery we can use [Bonjour](https://developer.apple.com/bonjour/), an open source technology which allows a device to publish and listen for services running on the same network. We can then get the ip address and port of the host device in order that we can connect. 

For connection we can use TCP/IP sockets to connect our devices and pass messages back and forth. The library I chose to use for this is called [CocoaAsyncSocket](https://github.com/robbiehanson/CocoaAsyncSocket).

## CocoaAsyncSocket


The first thing to do, following the intructions in the [Readme](https://github.com/robbiehanson/CocoaAsyncSocket), is to install CocoaAsyncSocket in your project. Use [CocoaPods](https://cocoapods.org/) and add this line to your Podfile:

```ruby
use_frameworks! # Add this if you are targeting iOS 8+ or using Swift
pod 'CocoaAsyncSocket'  
```

The class we are going to be using from CocoaAsyncSocket is called GCDAsyncSocket. It is a thread-safe TCP/IP socket that runs entirely within it's own [GCD](https://developer.apple.com/documentation/DISPATCH) queue and uses a delegate pattern to execute callbacks on the queue you supplied. Sockets are used to connect two devices over a network so that they can exchange messages. If any of this is sounding new or unfamiliar to you I highly recommend reading the [CoacoaAsyncPods wiki](https://github.com/robbiehanson/CocoaAsyncSocket/wiki).
The wiki does an excellent job introducing networking concepts and reading and writing using the [GCDAsyncSocket](https://github.com/robbiehanson/CocoaAsyncSocket/wiki/Intro_GCDAsyncSocket) library. 

## Hosting

In order to maintain communication and a shared state between more than 2 devices, we will use a client-server model for this app. One device will act as a host, and every other device will act as a client of that host. Thus there will be a socket connection between each client and the host. The host must accept socket connections over the network.

We'll create a variable as a property of our view controller to hold our socket as well as a dispatch queue for the socket to do work in.

```swift
var socket: GCDAsyncSocket?
let socketQueue = DispatchQueue.init(label: "HostSocketQueue")
```

Then, when we want to start hosting, we'll initialize a socket and start accepting connections.

```swift
// Create the listen socket
socket = GCDAsyncSocket(delegate: self, delegateQueue: socketQueue)
do {
    try socket?.accept(onPort: 0)
} catch let error {
    print("ERROR: \(error)")
    return
}
```

Passing `0` as the port argument allows the system to provide us a port. You can get the port number after the accept invocation.

```swift
let port = socket!.localPort
```

Now our host device has a socket that is accepting connections. We need our view controller to adopt the `GCDAsyncSocketDelegate` protocol to get a callback when new sockets are accepted. When a client device connects, we will get a reference to the client's socket. We'll create another property on our view controller to hold the connected client sockets.

```swift
var connectedSockets: [GCDAsyncSocket] = []
```

Then we will implement a method of the `GCDAsyncSocketDelegate` protocol.

```swift 
func socket(_ sock: GCDAsyncSocket, didAcceptNewSocket newSocket: GCDAsyncSocket) {
    connectedSockets.append(newSocket)
}
```

Now we have a reference to the socket on the connected client device. This is what we, the host device, will use to read data from and write to. When the client disconnects, we will want to remove the socket from our `connectedSockets` array, so we'll implement another delegate method.

```swift
func socketDidDisconnect(_ sock: GCDAsyncSocket, withError err: Error?) {
    print("Socket did disconnect \(err?.localizedDescription ?? "")")
    if let index = connectedSockets.firstIndex(of: sock) {
        connectedSockets.remove(at: index)
    }
}
```

That covers the basic lifecycle of creating a socket to accept connections, and getting connected client sockets to read and write messages, but there is one more thing the host needs to do. 

In order for clients to connect, they need to know the ip address and port number of the host device. We can publish and discover our service over the network using [Bonjour](https://developer.apple.com/bonjour/), also known as zero-configuration networking.

## NetService

As the host device, we will be publishing a service over the network that client devices will be able to discover. We need to use the [NetService](https://developer.apple.com/documentation/foundation/netservice) class to accomplish this. First, create a new view controller property to reference an instance of `NetService`.

```swift
var netService: NetService?
```

Once we have created a socket and are accepting connections, we'll publish our service.

```swift
// Publish a NetService
netService = NetService(domain: "local.", type: "_LocalNetworkingApp._tcp.", name: "LocalNetworkingApp", port: Int32(port))
netService?.delegate = self
netService?.publish()
```

When initializing our `NetService`, we use `"local".` to limit registration to the local domain. The type of our service we will call `LocalNetworkingApp` and we will specify TCP as the protocol (this could be a value such as `"_http._tcp"`, for example, to specify an HTTP service). We also give it a name and provide the port that our socket is accepting connections on.

Our view controller will need to adopt the `NetServiceDelegate` protocol. As a host you will be interested in the following delegate methods:

```swift
func netServiceDidPublish(_ sender: NetService) {
    print("Bonjour Service Published: domain(\(sender.domain)) type(\(sender.type)) name(\(sender.name)) port(\(sender.port))")
}

func netService(_ sender: NetService, didNotPublish errorDict: [String : NSNumber]) {
    print("Failed to publish Bonjour Service domain(\(sender.domain)) type(\(sender.type)) name(\(sender.name))\n\(errorDict)")
}
```

The call to `netService?.publish()` finally makes our service discoverable by the client devices.

## Clients

Once one device running our app is acting as the host, the rest of the devices will act as clients. The first thing to do is to discover the service so we can connect to the address of the host. For this we can use the `NetServiceBrowser` class. As always, use a property on your view controller to hold your instance of `NetServiceBrowser`.

```swift
var netServiceBrowser: NetServiceBrowser?
```

Then when we are ready to discover a service we will initialize the browser and search for our service.

```swift 
netServiceBrowser = NetServiceBrowser()
netServiceBrowser?.delegate = self
netServiceBrowser?.searchForServices(ofType: "_LocalNetworkingApp._tcp.", inDomain: "local.")
```

Of course, we'll need our view controller to adopt the `NetServiceBrowserDelegate` protocol. When we find the service published by the host, we'll grab an instance of the host `NetService` and attempt to resolve it.

```swift
extension ViewController: NetServiceBrowserDelegate {
    func netServiceBrowser(_ browser: NetServiceBrowser, didNotSearch errorDict: [String : NSNumber]) {
        print("ERROR: \(errorDict)")
    }
    
    func netServiceBrowser(_ browser: NetServiceBrowser, didFind service: NetService, moreComing: Bool) {
        if netService == nil {
            netService = service
            netService?.delegate = self
            netService?.resolve(withTimeout: 5)
        }
    }
    
    func netServiceBrowserDidStopSearch(_ browser: NetServiceBrowser) {
        print("NetServiceBrowser did stop search")
    }
}
```

When the `NetService` resolves, we will get a callback through the methods of the `NetServiceDelegate` protocol. First let's create a variable to hold the server addresses that will be returned by the service.

```swift
var serverAddresses: [Data]?
```

Then implement the `NetServiceDelegate` methods.

```swift
func netService(_ sender: NetService, didNotResolve errorDict: [String : NSNumber]) {
    print("NetService did not resolve: \(errorDict)")
}

func netServiceDidResolveAddress(_ sender: NetService) {
    if serverAddresses == nil {
        serverAddresses = sender.addresses
    }
    if socket == nil {
        socket = GCDAsyncSocket(delegate: self, delegateQueue: socketQueue)
        connectToNextAddress()
    }
}
```

We hold on to the addresses of the host we will connect to. We also created a socket which will connect to the host address. Let's look at the `connectToNextAddress()` method.

```swift
func connectToNextAddress() {
    var done = false
    while (!done && serverAddresses?.count ?? 0 > 0) {
        if let addr = serverAddresses?.remove(at: 0) {
            do {
                try socket?.connect(toAddress: addr)
                done = true
            } catch let error {
                print("ERROR: \(error)")
            }
        }
    }

    if !done {
        print("Unable to connect to any resolved address")
    }
}
```

Here we try to connect to the addresses resovled by the host service that we discovered. When the socket connects to the host, we will be notified via a delegate method of `GCDAsyncSocketDelegate`. We'll create a boolean view controller property to track wether we as the client are connected.

```swift
var connected = false
```

Then we'll update the value in our `GCDAsyncSocketDelegate` methods.

```swift
func socket(_ sock: GCDAsyncSocket, didConnectToHost host: String, port: UInt16) {
    print("Socket did connect to host \(host) on port \(port)")
    connected = true
}


func socketDidDisconnect(_ sock: GCDAsyncSocket, withError err: Error?) {

    // ...

    connected = false
}
```

That's it! Now our client devices can discover and connect to the host device. Our app has the ability to connect with other instances of itself running on the same network. 

Of course the whole point of this is so that we can pass messages between them, so let's talk about reading and writing a bit.

## Sending Messages

As long as our devices are connected, we want to be constantly reading a stream of data coming over the network. In order to know when a message begins and ends we will use a terminator. There are other ways to do this, such as reading certain lenghts of data at a time, but for simplicity's sake, we'll say that a message ends with the string `'\r\n'`. Fortunately, `GCDAsyncSocket` provides this as `Data` for us using the `GCDAsyncSocket.crlfData()` static method.

When a host accepts a new client, we want to start reading from the socket immediately, until we reach our terminator.

```swift
func socket(_ sock: GCDAsyncSocket, didAcceptNewSocket newSocket: GCDAsyncSocket) {

    // ...

    // Wait for a message
    newSocket.readData(to: GCDAsyncSocket.crlfData(), withTimeout: -1, tag: ViewController.MESSAGE_TAG)
}
```

When a client connects to the host, we also want to start reading immediately from the socket.

```swift
func socket(_ sock: GCDAsyncSocket, didConnectToHost host: String, port: UInt16) {

    // ...

    // Connected to host, wait for a name
    socket?.readData(to: GCDAsyncSocket.crlfData(), withTimeout: -1, tag: ViewController.NAME_TAG)
}
```

The tag argument is an integer that is used to distinguish types of messages. That means the only data that will be read by this invocation is data sent using the same tag. In my case, the messaging app will assign a name to the client when they connect, so as the client the first message we want to read is a name.

We can send any `Data` over the network, but if we want to send a string, it's as simple as encoding the string and sending it over the socket. Of course we must end our message with the terminator so we know when to stop reading, so we'll append the terminator data to our message. In the client's case that will look like this:

```swift
guard var data = "Hello, world!".data(using: .utf8) else {
    print("ERROR: Couldn't encode string")
    return
}
data.append(GCDAsyncSocket.crlfData())
socket?.write(data, withTimeout: -1, tag: ViewController.MESSAGE_TAG)
```

For the host we may want to send a message to an individual client by writing to just their socket, or we may want to send a message to all the connected clients.

```swift
for client in connectedSockets {
    client.write(data, withTimeout: -1, tag: ViewController.MESSAGE_TAG)
}
```

Wether we are the host or a client, we will read data using the `GCDAsyncSocketDelegate` method.

```swift
func socket(_ sock: GCDAsyncSocket, didRead data: Data, withTag tag: Int) {
    // We may want to read messages differently depending on the tag
    print("Socket did read data with tag \(tag)")

    // If our data is a string we can decode it
    if let string = String(data: data, encoding: .utf8) {
        print(string)
    }

    // Finally we should continue to read data from the socket
    sock.readData(to: GCDAsyncSocket.crlfData(), withTimeout: -1, tag: ViewController.MESSAGE_TAG)
}
```

Of course this `Data` could contain JSON strings, images or anything else you want to send.

## Finishing Up

When we want to end the connection from the host or stop hosting we should do some cleanup.

```swift
if host {
    // Stop listening
    socket?.disconnect()

    netService?.stop()
    netService = nil

    // Remove the clients
    for socket in connectedSockets {
        socket.disconnect()
    }

    socket = nil

} else {
    netServiceBrowser?.stop()
    socket?.disconnect()
    socket = nil
    netService = nil
    serverAddresses = nil
}
```

## Done

There are a few more details to pay attention to, but the above should cover the essentials of how to connect multiple devices running the same app over the local network and send messages back and forth. For a complete example of an app doing this, you can see my example [messaging app](https://github.com/brendaninnis/LocalNetworkingApp).

Part 2 of this tutorial series shows how to build an Android app that can connect to this one, which can be found [here](http://brendaninnis.ca/connect-nearby-devices-part-2.html)

In future parts of this series I will explain how to accomplish the same thing using Bluetooth communication. If there's anything I didn't explain or anything else you want to know, I'd love it if you left a comment.
