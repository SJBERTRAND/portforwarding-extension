import Gio from 'gi://Gio';
import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk?version=4.0';
import Vte from 'gi://Vte?version=3.91';
import GLib from 'gi://GLib';

import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';


export default class SSHPortForwardingPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        // Create a preferences page, with a single group
        const page = new Adw.PreferencesPage({
            title: _('General'),
            icon_name: 'dialog-information-symbolic',
        });
        window.add(page);

        const group = new Adw.PreferencesGroup({
            title: _('Port Forwarding through SSH connection'),
            description: _('On New Connection First Time Connection Required'),
        });
        page.add(group);
        
        //Create and new entry row for the connection name
        const connection_name = new Adw.EntryRow({
            title: _('Enter Connection Name'),
            show_apply_button : true,
        });
        group.add(connection_name);
        
        //Create and new entry row for host port
        const host_port_row = new Adw.EntryRow({
            title: _('Enter host port'),
            show_apply_button : true,
        });
        group.add(host_port_row);
        
        
        //Create and new entry row for host name
        const host_address_row = new Adw.EntryRow({
            title: _('Enter host name/IP'),
            show_apply_button : true,
        });
        group.add(host_address_row);
        
        //Create and new entry row for remote port
        const remote_port_row = new Adw.EntryRow({
            title: _('Enter remote port'),
            show_apply_button : true,
        });
        group.add(remote_port_row);
        
         //Create and new entry row for remote address
        const remote_address_row = new Adw.EntryRow({
            title: _('Enter remote address/ip'),
            show_apply_button : true,
        });
        group.add(remote_address_row);
        
        //Create and new entry row for remote address
        const remote_login_name = new Adw.EntryRow({
            title: _('Enter remote login name'),
            show_apply_button : true,
        });
        group.add(remote_login_name);
        
        // Create password required row
        
        const pass_switch = new Adw.SwitchRow({
            title: "Use Password instead of key file"
        });
        group.add(pass_switch);
        
        // Create password row
        const pass_row = new Adw.PasswordEntryRow({
            title: _('Enter remote password '),
        });
        group.add(pass_row);
        
        //Create a action row with a button for first connection
        const FirstConnect = new Adw.ActionRow({ title: "First Time Connection" });
        let ConnectButton = new Gtk.Button({ label: 'Connect', valign: Gtk.Align.CENTER });
        ConnectButton.connect('clicked', () => {
            log("Clicked");
            // Open a terminal window
        
        // Import the settings
        const _settings = this.getSettings();
        
             /// Terminal Window ///
        let term_win = new Gtk.Window({
            title: 'First Connection',
            modal: true,
            destroy_with_parent: true,
            resizable: false,
            default_height: 480,
            default_width: 640.
        });
        
        //Create a box in the window
        let _box = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL,
            halign: Gtk.Align.END,
            });
        term_win.child=_box;
        
        // Create a Terminal with the first command and attach it to the box
        
        const _TermCommand = ["/usr/bin/ssh", _settings.get_string('remote-login')+"@"+_settings.get_string('remote-address') ];
        
        
        const _Pty = Vte.Pty.new_sync( Vte.PtyFlags.DEFAULT , null);
        _Pty.spawn_async(null, _TermCommand ,null, GLib.SpawnFlags.DEFAULT,null, -1, null, null );

        const _Terminal = new Vte.Terminal ({
            input_enabled: true,
            pty: _Pty,
            });
        _box.append(_Terminal);            
            
        term_win.present();
        
        }); // End of button clicked
        FirstConnect.add_suffix(ConnectButton);
        group.add(FirstConnect);
        
 
        // Create a settings object and bind the host_port_row to the `host-port` key
        window._settings = this.getSettings();
        window._settings.bind('connection-name', connection_name, 'text',
            Gio.SettingsBindFlags.DEFAULT);
        window._settings.bind('host-port', host_port_row, 'text',
            Gio.SettingsBindFlags.DEFAULT);
        window._settings.bind('host-address', host_address_row, 'text',
            Gio.SettingsBindFlags.DEFAULT);
        window._settings.bind('remote-port', remote_port_row, 'text',
            Gio.SettingsBindFlags.DEFAULT);
        window._settings.bind('remote-address', remote_address_row, 'text',
            Gio.SettingsBindFlags.DEFAULT);
        window._settings.bind('remote-login', remote_login_name, 'text',
            Gio.SettingsBindFlags.DEFAULT);
        window._settings.bind('remote-password', pass_row, 'text',
            Gio.SettingsBindFlags.DEFAULT);
        window._settings.bind('pass-required', pass_switch, 'active',
            Gio.SettingsBindFlags.DEFAULT);
    }
}
