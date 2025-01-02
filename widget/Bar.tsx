import { App, Astal, Gtk, Gdk } from "astal/gtk3";
import { Variable, GLib, bind } from "astal";
import Hyprland from "gi://AstalHyprland";
import Mpris from "gi://AstalMpris";
import Battery from "gi://AstalBattery";
import Wp from "gi://AstalWp";
import Network from "gi://AstalNetwork";
import Tray from "gi://AstalTray";

function Launcher() {
  return (
    <button
      className="Launcher"
      onClicked={() => {
        App.toggle_window("launcher");
      }}
    >
      🐧
    </button>
  );
}

function SysTray() {
  const tray = Tray.get_default();

  return (
    <box vertical className="SysTray">
      {bind(tray, "items").as((items) =>
        items.map((item) => (
          <menubutton
            tooltipMarkup={bind(item, "tooltipMarkup")}
            usePopover={false}
            actionGroup={bind(item, "action-group").as((ag) => [
              "dbusmenu",
              ag,
            ])}
            menuModel={bind(item, "menu-model")}
          >
            <icon gicon={bind(item, "gicon")} />
          </menubutton>
        )),
      )}
    </box>
  );
}

function Wifi() {
  const network = Network.get_default();
  const wifi = bind(network, "wifi");

  return (
    <box vertical visible={wifi.as(Boolean)}>
      {wifi.as(
        (wifi) =>
          wifi && (
            <icon
              tooltipText={bind(wifi, "ssid").as(String)}
              className="Wifi"
              icon={bind(wifi, "iconName")}
            />
          ),
      )}
    </box>
  );
}

function AudioSlider() {
  const speaker = Wp.get_default()?.audio.defaultSpeaker!;

  return (
    <box className="AudioSlider" vertical>
      <slider
        height_request={140}
        vertical
        inverted
        onDragged={({ value }) => (speaker.volume = value)}
        value={bind(speaker, "volume")}
      />
      <icon icon={bind(speaker, "volumeIcon")} />
    </box>
  );
}

function Separator(space: number) {
  return <label heightRequest={space} label="—" css="margin: 0px;" />;
}

function BatteryLevel() {
  const bat = Battery.get_default();

  return (
    <box vertical className="Battery" visible={bind(bat, "isPresent")}>
      <icon icon={bind(bat, "batteryIconName")} />
      <label
        label={bind(bat, "percentage").as((p) => `${Math.floor(p * 100)}%`)}
      />
    </box>
  );
}

function Media() {
  const mpris = Mpris.get_default();

  return (
    <box vertical className="Media">
      {bind(mpris, "players").as((ps) =>
        ps[0] ? (
          <button
            className="Cover"
            halign={Gtk.Align.CENTER}
            css={bind(ps[0], "coverArt").as(
              (cover) => `background-image: url('${cover}');`,
            )}
            onClicked={() => {
              App.toggle_window("player");
            }}
          />
        ) : (
          "ツ"
        ),
      )}
    </box>
  );
}

function Workspaces() {
  const hypr = Hyprland.get_default();

  return (
    <box vertical className="Workspaces">
      {bind(hypr, "workspaces").as((wss) =>
        wss
          .filter((ws) => !(ws.id >= -99 && ws.id <= -2)) // filter out special workspaces
          .sort((a, b) => a.id - b.id)
          .map((ws) => (
            <button
              className={bind(hypr, "focusedWorkspace").as((fw) =>
                ws === fw ? "focused" : "",
              )}
              onClicked={() => ws.focus()}
            >
              {ws.id}
            </button>
          )),
      )}
    </box>
  );
}

function FocusedClient() {
  const hypr = Hyprland.get_default();
  const focused = bind(hypr, "focusedClient");

  return (
    <box className="Focused" visible={focused.as(Boolean)}>
      {focused.as(
        (client) =>
          client && <label label={bind(client, "title").as(String)} />,
      )}
    </box>
  );
}

function Time({ format = "%H:%M - %A %e." }) {
  const time = Variable<string>("").poll(
    1000,
    () => GLib.DateTime.new_now_local().format(format)!,
  );

  return (
    <label className="Time" onDestroy={() => time.drop()} label={time()} />
  );
}

export default function Bar(monitor: Gdk.Monitor) {
  const { TOP, BOTTOM, RIGHT } = Astal.WindowAnchor;

  return (
    <window
      className="Bar"
      margin={8}
      gdkmonitor={monitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | BOTTOM | RIGHT}
    >
      <centerbox vertical>
        <box vertical vexpand valign={Gtk.Align.START}>
          <Launcher />
          <Workspaces />
        </box>
        <box vertical>
          <Media />
        </box>
        <box vertical vexpand valign={Gtk.Align.END}>
          <SysTray />
          <Wifi />
          {Separator(10)}
          <AudioSlider />
          {Separator(10)}
          <BatteryLevel />
          {Separator(10)}
          <Time format="%H" />
          <Time format="%M" />
          {Separator(10)}
        </box>
      </centerbox>
    </window>
  );
}
