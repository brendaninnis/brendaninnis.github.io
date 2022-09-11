---
layout: post
title: "Connect Nearby Devices Part 2: Local Networking Android"
description: "Learn to build an Android app that connects nearby devices over a local network."
permalink: /connect-nearby-devices-part-2.html
categories:
  - Mobile
tags:
  - Android
  - Kotlin
  - Networking
  - Nearby Devices
---

This post will show you how to create an Android app that can run on multiple nearby devices and connect them via a local network. This is part 2 of a larger tutorial that will explain how you can connect an app to other instances of the same app running on multiple devices and platforms.

In [part 1](connect-nearby-devices-part-1.html) of this tutorial we built an iOS app that can connect to other instances of the same app. In this part we will build an Android app that can connect and share data between other instances of the same Android app, and the iOS app from part 1.

## Example Local Networking App

I built and Android app that can join a realtime messaging chat with any other devices on the same local network. This is a port of the iOS app that was linked in part 1. These two apps can connect on the same network and join the same chat cross-platform on Android and iOS. The finished app is available here: [Finished Example](https://github.com/brendaninnis/LocalNetworkingAndroidApp).

## Connecting devices over a local network

There are 2 parts to building this app, discovery and connection.

Discovery means we need devices running the same app to be able to see each other so that they can connect. For discovery we will use the native Android [Network Service Discovery](https://developer.android.com/training/connect-devices-wirelessly/nsd) classes. This is equivalent and compatible with Bonjour on Apple devices and will allow us to publish and listen for services running on the same network. We can then get the ip address and port of the host device in order that we can connect.

For connection we will use TCP/IP sockets to connect our devices and pass messages back and forth. The classes from the native [java.net](https://docs.oracle.com/javase/7/docs/api/java/net/package-summary.html) package will provide the sockets that we need.

## Hosting

In order to maintain communication and a shared state between more than 2 devices, we will use a client-server model for this app. One device will act as a host, and every other device will act as a client of that host. Thus there will be a socket connection between each client and the host. The host must accept socket connections over the network.

First, we'll create a variable as a field of our Activity to hold our server socket.

```kotlin
var serverSocket: ServerSocket? = null
```

Then, when we want to start hosting, we'll initialize a server socket. Passing `0` as the port argument allows the system to provide us a port. We'll get and store this port number for use later.

```kotlin
// Create a listen socket
val port: Int
serverSocket = ServerSocket(0).also { socket ->
    // Store the chosen port.
    port = socket.localPort
}
```

The `accept` method of `ServerSocket` is a long running, blocking method that listens for a connection to be made. We will call the method in a while loop so that when a connection is made, we can hold on to the new client socket, and then the loop will call `accept` again and wait for the next client.

Since we are calling a blocking method in an indeterminate while loop, we will need to run this code in it's own thread so we do not block the execution of our app. 

```kotlin
Thread(Runnable {
    while (serverSocket != null) {
        try {
            serverSocket?.accept()?.let {
                Log.d("ServerSocket", "accepted client")

                // Hold on to the client socket
                connectedClients.add(it)
            }
        } catch (e: SocketException) {
            break
        }
    }
}).start()
```

Now we have a thread that will execute our while loop until we decide to close our socket and set the value back to `null`. The server socket will wait to accept a connection from a client, and when it does, it will hold on to the client socket and the loop will run again and wait to accept the next client.

To get rid of the compiler error from the code above, we will add a variable as a field of our Activity that will hold onto the client sockets.

```kotlin
var connectedClients: MutableList<Socket> = CopyOnWriteArrayList<Socket>()
```

We are using `CopyOnWriteArrayList` to ensure the thread safety of mutations on our list of clients. This class is inefficient if we are planning to mutate it a lot and if the list size will be very large, but for our purposes it will work very well and ensure thread safety with very little work on our part. 

Now we have a server socket that is accepting connections and keeping track of it's clients. In order for our clients to discover the server and connect, they need to know the ip address and port number of the host device. We can publish and discover our service over the network using [NSD](https://developer.android.com/training/connect-devices-wirelessly/nsd).

## Using Android Network Service Discovery

As the host device, we will be publishing a service over the network that client devices will be able to discover.
First we need an instance of `NsdManager` which we will lazy load as a field on our activity.

```kotlin
val nsdManager: NsdManager by lazy {
    (getSystemService(Context.NSD_SERVICE) as NsdManager)
}
```

Next we will need an instance of `NsdManager.RegistrationListener` to listen for callbacks. You will want to add code to the functions you will override in order to respond to errors and other important events.

```kotlin
private val registrationListener = object : NsdManager.RegistrationListener {
    override fun onServiceRegistered(NsdServiceInfo: NsdServiceInfo) {
        // Save the service name. Android may have changed it in order to
        // resolve a conflict, so update the name you initially requested
        // with the name Android actually used.
        Log.d("NsdManager.Registration", "Service registered")
    }

    override fun onRegistrationFailed(serviceInfo: NsdServiceInfo, errorCode: Int) {
        // Registration failed! Put debugging code here to determine why.
        Log.d("NsdManager.Registration", "Registration failed")
    }

    override fun onServiceUnregistered(arg0: NsdServiceInfo) {
        // Service has been unregistered. This only happens when you call
        // NsdManager.unregisterService() and pass in this listener.
        Log.d("NsdManager.Registration", "Service unregistered")
    }

    override fun onUnregistrationFailed(serviceInfo: NsdServiceInfo, errorCode: Int) {
        // Unregistration failed. Put debugging code here to determine why.
        Log.d("NsdManager.Registration", "Unregistration failed")
    }
}
```

Once we have created a server socket and are accepting connections, we'll publish our service.

```kotlin
// Create the NsdServiceInfo object, and populate it.
val serviceInfo = NsdServiceInfo().apply {
    // The name is subject to change based on conflicts
    // with other services advertised on the same network.
    serviceName = "LocalNetworkingApp"
    serviceType = "_LocalNetworkingApp._tcp."
    setPort(port)
}

// Register the service for discovery
nsdManager.registerService(serviceInfo, NsdManager.PROTOCOL_DNS_SD, registrationListener)
```

The name and type of our service will be `LocalNetworkingApp` and we will specify TCP as the protocol (this could be a value such as `"_http._tcp"`, for example, to specify an HTTP service). This will indicate that our service is for our local networking app and that the TCP protocol will be used.

Our service is now being broadcast over the local network so clients will be able to discover it and get the ip address and port number to connect to.

## Clients

Once one device running our app is acting as the host, the rest of the devices will act as clients. The first thing to do is to discover the service so we can connect to the address of the host. We will use an instance of `NsdManager` to discover our service.

```kotlin
nsdManager.discoverServices("_LocalNetworkingApp._tcp.", NsdManager.PROTOCOL_DNS_SD, discoveryListener)
```

We are looking for services of our type. The `discoveryListener` will be a field on our activity that is an instance of `NsdManager.DiscoveryListener`.

```kotlin
private val discoveryListener = object : NsdManager.DiscoveryListener {

    val TAG = "discoveryListener"

    // Called as soon as service discovery begins.
    override fun onDiscoveryStarted(regType: String) {
        Log.d(TAG, "Service discovery started")
    }

    override fun onServiceFound(service: NsdServiceInfo) {
        Log.d(TAG, "Service found ${service.serviceName}")
        
        nsdManager.resolveService(service, resolveListener)
    }

    override fun onServiceLost(service: NsdServiceInfo) {
        // When the network service is no longer available.
        // Internal bookkeeping code goes here.
        Log.e(TAG, "service lost: $service")
    }

    override fun onDiscoveryStopped(serviceType: String) {
        Log.i(TAG, "Discovery stopped: $serviceType")
    }

    override fun onStartDiscoveryFailed(serviceType: String, errorCode: Int) {
        Log.e(TAG, "Discovery failed: Error code:$errorCode")
        nsdManager.stopServiceDiscovery(this)
    }

    override fun onStopDiscoveryFailed(serviceType: String, errorCode: Int) {
        Log.e(TAG, "Discovery failed: Error code:$errorCode")
        nsdManager.stopServiceDiscovery(this)
    }
}
```

The important method above is `onServiceFound`. Once we have discovered our service, we need to resolve it using an instance of `NsdManager.ResolveListener`. Create another field on your activity called `resolveListener` and one called `socket` to hold the socket that will connect to the host.

```kotlin
var socket: Socket? = null

private val resolveListener = object : NsdManager.ResolveListener {

    val TAG = "resolveListener"

    override fun onResolveFailed(serviceInfo: NsdServiceInfo, errorCode: Int) {
        // Called when the resolve fails. Use the error code to debug.
        Log.e(TAG, "Resolve failed: $errorCode")
    }

    override fun onServiceResolved(serviceInfo: NsdServiceInfo) {
        Log.e(TAG, "Resolve Succeeded. $serviceInfo")

        socket?.let {
            Log.i(TAG, "Socket already connected $it")
            return
        }

        try {
            // Connect to the host
            socket = Socket(serviceInfo.host, serviceInfo.port)
        } catch (e: UnknownHostException) {
            Log.e(TAG, "Unknown host. ${e.localizedMessage}")
        }
    }
}
```

Assuming no exception was thrown we now have a socket connected to a host device.

That's it! Now our app has the ability to connect with other instances of itself running on the same network.

Of course the whole point on this is so that we can pass messages between them, so let's go over reading and writing to sockets.

## Sending Messages

As long as our devices are connected, we will be constantly reading a stream of data coming over the network. In order to know when a message begins and ends we will use a terminator. To comply with our iOS app from the previous part of this tutorial, we will use `"\r\n"`. Add this to the top of your Kotlin Activity file, below the imports:

```kotlin
const val MESSAGE_TERMINATOR = "\r\n"
```

First, let's create a class in our activity for the host device that will read messages from connected clients. Since we will be creating an indeterminate while loop, this class will be a subclass of `Runnable` so we can pass it as an argument to a new thread. 

```kotlin
inner class ClientReader(private val client: Socket): Runnable {
    val TAG = "ClientReader"

    override fun run() {
        var line: String?
        val reader: BufferedReader

        try {
            reader = BufferedReader(InputStreamReader(client.getInputStream()))
        } catch (e: IOException) {
            Log.w(TAG, "BufferedReader failed to initialize")

            connectedClients.remove(client)
            return
        }

        while (true) {
            try {
                line = reader.readLine()

                if (line == null) {
                    connectedClients.remove(client)
                    break
                }

                Log.d(TAG, "Read line $line")

            } catch (e: IOException) {
                connectedClients.remove(client)
                break
            }
        }
    }
}
```

Each iteration of the while loop will call the `readLine` method of `BufferedReader`, which will read until our terminator. If the connection is terminated we will remove the client and break the while loop in order to end the execution of our `Runnable`.

When a host accepts a new client, we will start reading from the socket immediately. Modify your code where you are accepting clients on the `ServerSocket` so it looks like this:

```kotlin
Thread(Runnable {
    while (serverSocket != null) {
        try {
            serverSocket?.accept()?.let {
                Log.d("ServerSocket", "accepted client")

                // Hold on to the client socket
                connectedClients.add(it)

                // Start reading messages
                Thread(ClientReader(it)).start()
            }
        } catch (e: SocketException) {
            break
        }
    }
}).start()
```

Now when our host accepts a new connection, we will start reading reading from the client socket on a new thread, which will continue until the client disconnects.

We'll create a similar reader class for our clients to use.

```kotlin
inner class ServerReader(private val socket: Socket): Runnable {
    val TAG = "ServerReader"

    override fun run() {
        var line: String?
        val reader: BufferedReader

        try {
            reader = BufferedReader(InputStreamReader(socket.getInputStream()))
        } catch (e: IOException) {
            Log.w(TAG, "BufferedReader failed to initialize")

            socket = null
            return
        }

        while (true) {
            try {
                line = reader.readLine()

                if (line == null) {
                    socket = null
                    break
                }

                Log.d(TAG, "Read line $line")

            } catch (e: IOException) {
                socket = null
                break
            }
        }
    }
}
```

The difference here is that when the server disconnects we will set our socket to `null` rather than removing a client like we did for the server.

When we want to send a message through the socket, wether it is from the client to the server or from the server to the client, we will use a subclass of `Writer` initialized with the output stream of the socket.

```kotlin
val writer: PrintWriter

try {
    writer = PrintWriter(socket.getOutputStream())
} catch (e: IOException) {
    // If the writer fails to initialize there was an io problem, close your connection
}
```

Then when you are ready to write a message call `print` and `flush`.

```kotlin
writer.print("Hello from the network!" + MESSAGE_TERMINATOR)
writer.flush()
```

Make sure to append the terminator to your message, so you know when to stop reading.

When you are done sending messages and ready to disconnect and close the socket, make sure you close your writer.

```kotlin
writer.close()
```

When we want to end the connection from the host or stop hosting we should do some cleanup.

```kotlin
if (host) {
    // Stop listening
    serverSocket?.close()
    serverSocket = null

    // Stop broadcasting service
    nsdManager.unregisterService(registrationListener)

    // Remove the clients
    connectedClients.forEach {
        it.close()
    }
} else {
    try {
        nsdManager.stopServiceDiscovery(discoveryListener)
    } catch (e: IllegalArgumentException) {
        Log.i("nsdManager", "discoveryListener not registered")
    }

    socket?.close()
    socket = null
}
```

## Done

This should be all you need to get started connecting multiple devices running the same app over the local network and sending messages back and forth. For a complete example of an app doing this, you can see my example [messaging app](https://github.com/brendaninnis/LocalNetworkingAndroidApp).

You can see part 1 of this tutorial series to build an iOS app that can connect to this one [here](connect-nearby-devices-part-1.html).

In future parts of this series I will explain how to accomplish the same thing using Bluetooth communication. If there's anything I didn't explain or anything else you want to know, I'd love it if you left a comment.
