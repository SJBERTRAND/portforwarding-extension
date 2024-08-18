import Gio from 'gi://Gio';
import Adw from 'gi://Adw';
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
            description: _('On New Connection connect using SSH in terminal'),
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
