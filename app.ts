import { App } from "astal/gtk3";
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

App.start({
  css: style,
  main() {
    App.get_monitors().map(Bar);
    App.get_monitors().map(NotificationPopups);
    App.get_monitors().map(VolumeAlert);
    App.get_monitors().map(ChargingAlertSound);
    App.get_monitors().map(BrightnessAlert);
    MprisPlayers();
    Applauncher();
    SystemMenuWindow();
  },
});
