import { App, Widget } from "astal/gtk3";
import style from "./style.scss";
import Bar from "./widget/Bar";
import MprisPlayers from "./widget/MediaPlayer";
import NotificationPopups from "./widget/NotificationPopups";
import Applauncher from "./widget/Applauncher";

App.start({
  css: style,
  main() {
    App.get_monitors().map(Bar);
    App.get_monitors().map(MprisPlayers);
    App.get_monitors().map(NotificationPopups);
    Applauncher();
  },
});
