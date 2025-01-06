import { App, Astal, Gtk, Gdk } from "astal/gtk3";
import { Variable, GLib, bind } from "astal";
import Hyprland from "gi://AstalHyprland";
import Mpris from "gi://AstalMpris";
import Battery from "gi://AstalBattery";
import Wp from "gi://AstalWp";
import Network from "gi://AstalNetwork";
import Tray from "gi://AstalTray";
import Bluetooth from "gi://AstalBluetooth";
import { SystemMenuWindowName } from "./systemMenu/SystemMenuWindow";
import { CircularProgress } from "astal/gtk3/widget";

function Divider({ css }: { css?: string }) {
  return <box className="divider" css={css ? css : ""} />;
}

function Launcher() {
  return (
    <button
      className="Launcher"
      onClicked={() => {
        App.toggle_window(SystemMenuWindowName);
      }}
    >
      ❄️
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

function BluetoothButton() {
  const bluetooth = Bluetooth.get_default();
  const isPowered = bind(bluetooth, "isPowered");
  return (
    <button
      visible={isPowered.as(Boolean)}
      className="iconButton"
      onClicked="overskride"
    >
      󰂯
    </button>
  );
}

function Wifi() {
  const network = Network.get_default();
  const wifi = bind(network, "wifi");

  return (
    <button visible={wifi.as(Boolean)} onClicked="ghostty -e nmtui">
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
    </button>
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

function Separator(space: number, separator = "—") {
  return (
    <label
      heightRequest={space}
      label={separator}
      className="separator"
      css="margin: 0px; padding: 0;"
    />
  );
}

function Volume() {
  const speaker = Wp.get_default()?.audio.defaultSpeaker!;

  return (
    <eventbox
      onScroll={(_, { delta_y }) => {
        const volumeChange = delta_y < 0 ? 0.05 : -0.05;
        speaker?.set_volume(speaker.volume + volumeChange);
        speaker?.set_mute(false);
      }}
      onClick={(_) => speaker?.set_mute(!speaker.get_mute())}
    >
      <CircularProgress
        className="CircleIndicator"
        value={bind(speaker, "volume")}
        startAt={0.75}
        endAt={0.75}
        rounded
        child={<icon icon={bind(speaker, "volumeIcon")} />}
      ></CircularProgress>
    </eventbox>
  );
}

function BatteryLevel() {
  // const bat = Battery.get_default();
  //
  // return (
  //   <box vertical className="Battery" visible={bind(bat, "isPresent")}>
  //     <icon icon={bind(bat, "batteryIconName")} />
  //     <label
  //       label={bind(bat, "percentage").as((p) => `${Math.floor(p * 100)}%`)}
  //     />
  //   </box>
  // );
  const battery = Battery.get_default();

  return (
    <CircularProgress
      visible={bind(battery, "isPresent")}
      className="CircleIndicator"
      value={bind(battery, "percentage").as((p: number) => p)}
      startAt={0.75}
      endAt={0.75}
      rounded
      child={<label css={"font-size: 16px;"} label={"󱐌"} />}
    ></CircularProgress>
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
            onClicked={() => {
              App.toggle_window("player");
            }}
          >
            🎵
          </button>
        ) : (
          <button
            className="Cover"
            halign={Gtk.Align.CENTER}
            onClicked="spotify"
          >
            🔇
          </button>
        ),
      )}
    </box>
  );
}

function groupByProperty(array: Hyprland.Workspace[]): Hyprland.Workspace[][] {
  const map = new Map<Hyprland.Monitor, Hyprland.Workspace[]>();

  array.forEach((item) => {
    const key = item.monitor;
    if (key === null) {
      return;
    }
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.unshift(item);
  });

  return Array.from(map.values()).sort((a, b) => {
    return a[0].monitor.id - b[0].monitor.id;
  });
}

// function Workspaces() {
//   const hypr = Hyprland.get_default();
//
//   return (
//     <box vertical className="Workspaces">
//       {bind(hypr, "workspaces").as((wss) =>
//         wss
//           .filter((ws) => !(ws.id >= -99 && ws.id <= -2)) // filter out special workspaces
//           .sort((a, b) => a.id - b.id)
//           .map((ws) => (
//             <button
//               className={bind(hypr, "focusedWorkspace").as((fw) =>
//                 ws === fw ? "focused" : "",
//               )}
//               onClicked={() => ws.focus()}
//             >
//               {ws.id}
//             </button>
//           )),
//       )}
//     </box>
//   );
// }

export function Workspaces() {
  const hypr = Hyprland.get_default();

  return (
    <box vertical>
      {bind(hypr, "workspaces").as((workspaces) => {
        const groupedWorkspaces = groupByProperty(workspaces);
        return groupedWorkspaces.map((workspaceGroup, index) => {
          return (
            <box vertical className="Workspaces">
              {index > 0 && index < groupedWorkspaces.length && <Divider />}
              {workspaceGroup
                .filter(
                  (workspace) => !(workspace.id >= -99 && workspace.id <= -2),
                ) // filter out special workspaces
                .sort((a, b) => {
                  return a.id - b.id;
                })
                .map((workspace) => (
                  <button
                    // to have balls for labels. I prefer numbers
                    // label={bind(workspace.monitor, "activeWorkspace").as(
                    //   (activeWorkspace) =>
                    //     activeWorkspace.id == workspace.id ? "" : "",
                    // )}
                    className={bind(workspace.monitor, "activeWorkspace").as(
                      (active) => (workspace.id === active.id ? "focused" : ""),
                    )}
                    onClicked={() => workspace.focus()}
                  >
                    {workspace.id}
                  </button>
                ))}
            </box>
          );
        });
      })}
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

function BigTime({ format = "%H:%M - %A %e." }) {
  const time = Variable<string>("").poll(
    1000,
    () => GLib.DateTime.new_now_local().format(format)!,
  );

  return (
    <label className="BigTime" onDestroy={() => time.drop()} label={time()} />
  );
}

function TimeWidget() {
  return (
    <button className="Launcher" onClicked="zen nc.soliprem.eu/apps/calendar">
      <box vertical>
        <Time format="%d/%m" />
        <BigTime format="%H" />
        <BigTime format="%M" />
        <Time format="%Y" />
      </box>
    </button>
  );
}

export default function Bar(monitor: Gdk.Monitor) {
  const { TOP, BOTTOM, RIGHT } = Astal.WindowAnchor;

  return (
    <window
      className="Bar"
      name="Bar"
      namespace="Bar"
      margin={8}
      gdkmonitor={monitor}
      application={App}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | BOTTOM | RIGHT}
    >
      <centerbox vertical>
        <box vertical vexpand valign={Gtk.Align.START}>
          <Launcher />
          <Workspaces />
        </box>
        <box vertical>
          <TimeWidget />
          {Separator(10)}
          <Media />
        </box>
        <box vertical vexpand valign={Gtk.Align.END}>
          <SysTray />
          <Wifi />
          <BluetoothButton />
          {Separator(10)}
          <Volume />
          {Separator(10)}
          <BatteryLevel />
        </box>
      </centerbox>
    </window>
  );
}
