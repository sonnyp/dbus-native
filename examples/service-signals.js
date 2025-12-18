import dbus from "../index.js";

/*
	This example show how to expose signals on a DBus service, and how to emit them.
*/

const serviceName = "com.dbus.native.signals"; // our DBus service name
/*
	The interface under which we will expose our signals (chose to be the same as the service name, but we can
	choose whatever name we want, provided it respects the rules, see DBus naming documentation)
*/
const interfaceName = serviceName;
/*
	The object path that we want to expose on the bus. Here we chose to have the same path as the service (and
	interface) name, with the dots replaced by slashes (because objects path must be on the form of UNIX paths)
	But again, we could chose anything. This is just a demo here.
*/
const objectPath = `/${serviceName.replace(/\./g, "/")}`;

// First, connect to the session bus (works the same on the system bus, it's just less permissive)
const sessionBus = dbus.sessionBus();

// Check the connection was successful
if (!sessionBus) {
  throw new Error("Could not connect to the DBus session bus.");
}

/*
	Then request our service name to the bus.
	The 0x4 flag means that we don't want to be queued if the service name we are requesting is already
	owned by another service ;we want to fail instead.
*/
const retCode = await sessionBus.requestName(serviceName, 0x4);
// Return code 0x1 means we successfully had the name
if (retCode === 1) {
  console.log(`Successfully requested service name "${serviceName}"!`);
  proceed();
} else {
  /* Other return codes means various errors, check here
(https://dbus.freedesktop.org/doc/api/html/group__DBusShared.html#ga37a9bc7c6eb11d212bf8d5e5ff3b50f9) for more
information
*/
  throw new Error(
    `Failed to request service name "${serviceName}". Check what return code "${retCode}" means.`,
  );
}

// Function called when we have successfully got the service name we wanted
function proceed() {
  // First, we need to create our interface description (here we will only expose method calls)
  var ifaceDesc = {
    name: interfaceName,
    signals: {
      // Defines a signal whose name is 'Tick' and whose output param is: string (s)
      Tick: ["s", "time"], // second argument is the name of the output parameters (for introspection)
      // Defines a signal whose name is 'Rand' and whose ouput param is: int32 (i)
      Rand: ["i", "random_number"],
    },
    // No methods nor properties for this example
    methods: {},
    properties: {},
  };

  // Then we need to create the interface implementation, it doesn't have any method or property
  var iface = {};
  // Now we need to actually export our interface on our object
  sessionBus.exportInterface(iface, objectPath, ifaceDesc);

  // Say our service is ready to receive function calls (you can use `gdbus call` to make function calls)
  console.log("Interface exposed to DBus, ready to receive function calls!");

  /*
		Here we emit the 'Tick' signal every 10 seconds. As you see, emitting a signal is just calling the 'signal()'
		function of the interface object with the first parameters being the signal name, and the other paramters, the
		actual output values of the signal.
	*/
  setInterval(() => {
    iface.signal("Tick", new Date().toString());
  }, 10e3);

  /*
		Here we emit another signal, 'Rand'. As you noticed, the 'signal()' function doesn't change whether we expose
		one or several signals.
		The random here is just so that the signals are not emitted too regularly (contrary to 'Tick')
	*/
  setInterval(() => {
    var proba = Math.round(Math.random() * 100);

    if (proba > 70) {
      var randomNumber = Math.round(Math.random() * 100);
      iface.signal("Rand", randomNumber);
    }
  }, 2000);
}
