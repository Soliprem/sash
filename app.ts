import { App, Gdk, Gtk } from "astal/gtk3";
import style from "./style.scss";
import Bar from "./widget/Bar";
import MprisPlayers from "./widget/MediaPlayer";
import NotificationPopups from "./widget/NotificationPopups";
import Applauncher from "./widget/Applauncher";
import SystemMenuWindow from "./widget/systemMenu/SystemMenuWindow";
import {
  ChargingAlertSound,
  VolumeAlert,
  BrightnessAlert,
} from "./widget/Alerts";
import Calendar from "./widget/Calendar";

function initializeBars() {
  const bars = new Map<Gdk.Monitor, Gtk.Widget>();

  // initialize
  for (const gdkmonitor of App.get_monitors()) {
    bars.set(gdkmonitor, Bar(gdkmonitor));
  }
  return bars;
}

const bars = initializeBars();

App.start({
  css: style,
  main() {
    App.connect("monitor-added", (_, gdkmonitor) => {
      bars.set(gdkmonitor, Bar(gdkmonitor));
    });

    App.connect("monitor-removed", (_, gdkmonitor) => {
      bars.get(gdkmonitor)?.destroy();
      bars.delete(gdkmonitor);
    });

    App.get_monitors().map(NotificationPopups);
    App.get_monitors().map(VolumeAlert);
    App.get_monitors().map(ChargingAlertSound);
    App.get_monitors().map(BrightnessAlert);
    MprisPlayers();
    Applauncher();
    SystemMenuWindow();
    Calendar();
  },
  requestHandler(request: string, res: (response: any) => void) {
    if (request === "bars") {
      for (const gdkmonitor of App.get_monitors()) {
        bars.get(gdkmonitor)?.set_visible(!bars.get(gdkmonitor)?.get_visible());
      }
      res("bars toggled");
    } else {
      res("command not found");
    }
  },
});
