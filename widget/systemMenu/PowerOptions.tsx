import {App, Gtk} from "astal/gtk3"
import {SystemMenuWindowName} from "./SystemMenuWindow";
import {execAsync} from "astal/process"

export default function () {
    return <box
        vertical={false}
        className="row"
        halign={Gtk.Align.CENTER}>
        <button
            className="systemMenuIconButton"
            label="󰍃"
            onClicked={() => {
                App.toggle_window(SystemMenuWindowName)
                execAsync("hyprctl dispatch quit")
            }}/>
        <button
            className="systemMenuIconButton"
            label=""
            onClicked={() => {
                App.toggle_window(SystemMenuWindowName)
                execAsync("hyprlock --immediate")
            }}/>
        <button
            className="systemMenuIconButton"
            label=""
            onClicked={() => {
                App.toggle_window(SystemMenuWindowName)
                execAsync("systemctl reboot")
            }}/>
        <button
            className="systemMenuIconButton"
            label="⏻"
            onClicked={() => {
                App.toggle_window(SystemMenuWindowName)
                execAsync("systemctl poweroff")
            }}/>
    </box>
}
