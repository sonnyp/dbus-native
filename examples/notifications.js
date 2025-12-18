import dbus from "../index.js";

const bus = dbus.sessionBus();
const service = bus.getService("org.freedesktop.Notifications");
const iface = await service.getInterface(
  "/org/freedesktop/Notifications",
  "org.freedesktop.Notifications",
);
console.log(iface);

await iface.subscribe("ActionInvoked", (...args) => {
  console.log("ActionInvoked", ...args);
});

await iface.subscribe("NotificationClosed", (...args) => {
  console.log("NotificationClosed", ...args);
});

const [id] = await iface.Notify(
  "exampl",
  0,
  "",
  "summary 3",
  "new message text",
  ["xxx yyy", "test2", "test3", "test4"],
  [],
  5,
);
console.log("Notificaton id", id);

setTimeout(() => iface.CloseNotification(id), 4000);
