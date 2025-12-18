import dbus from "../index.js";

/*
	This example shows how to query a DBus service and listen for its signals.
	Since we're acting only as a client, there is not need to request a name: we don't need to register a service
	against the bus (but we could!), so we only act as a client.

	NOTE: this file is made to query the service that is exposed in the file 'server-signals.js', so be sure to
	start it first (node server-signals.js in another terminal should be enough)
)
*/

// This is the DBus service we will query (server-signals.js)
const targetServiceName = "com.dbus.native.signals";

// This is the service's interface we will query
const targetIfaceName = targetServiceName; // note that is it equal to the service name, but this is not mandatory at all

// This is the service's DBus object path that we will query for the properties
const targetObjectPath = `/${targetServiceName.replace(/\./g, "/")}`;

// First, connect to the session bus (works the same on the system bus, it's just less permissive)
const sessionBus = dbus.sessionBus();

// Check the connection was successful
if (!sessionBus) {
  throw new Error("Could not connect to the DBus session bus.");
}

// First, we must query the bus for the desired DBus service:
const targetService = sessionBus.getService(targetServiceName);

// Then we must query it's interface, this is callback-based
const iface = await targetService.getInterface(
  targetObjectPath,
  targetIfaceName,
);

/*
		Here, 'iface' represents the service's interface. Here is how to listen for signals
	*/
await iface.subscribe("Tick", (date) => {
  console.log(`Signal 'Tick' received! The date is: '${date}'`);
});

/*
		Here we listen for the second signal.
	*/
await iface.subscribe("Rand", (randomNumber) => {
  console.log(`We've got our random number: ${randomNumber}`);
});
