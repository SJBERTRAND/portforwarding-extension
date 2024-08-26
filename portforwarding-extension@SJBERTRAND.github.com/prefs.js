import Gio from 'gi://Gio';
import Adw from 'gi://Adw';
import GLib from 'gi://GLib';

import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

// Function to create each connection pages
function CreateConnection(window,number){
        const page = new Adw.PreferencesPage({
            title: _('Server '+number),
            icon_name: _('security-high'), 
        });
        window.add(page)
        
        // SSH option Group
        const group = new Adw.PreferencesGroup({
            title: _('Server '+number+' settings'),
        });
        page.add(group);
        
        //Create a server name 
        const ServerNameRow = new Adw.EntryRow({
            title: _('Server Name'),
        });
        group.add(ServerNameRow);
        
        //Create and new entry row for remote address
        const RemoteAddressRow = new Adw.EntryRow({
            title: _('Enter remote server address/ip'),
        });
        group.add(RemoteAddressRow);
        
        //Create a row for remote port
        const RemotePortRow = new Adw.EntryRow({
            title: _('Enter remote server port(s)'),
        });
        group.add(RemotePortRow);
        
        // Create an action row
        const InfoRow = new Adw.ActionRow({
            title: _('For multiple ports separate the port numbers with a space'),
            subtitle: _('The first remote port will bind with the first host port and so on'),
        });
        group.add(InfoRow);
        
        //Create a row for host port
        const HostPortRow = new Adw.EntryRow({
            title: _('Enter host server port(s)'),
        });
        group.add(HostPortRow);
        
        //Create a login row
        const RemoteUserNameRow = new Adw.EntryRow({
            title: _('Enter remote server username'),
        });
        group.add(RemoteUserNameRow);
        
        //Create a password required switch
        const PasswordSwitch = new Adw.SwitchRow({
            title: _('Use password instead of key file'),
        });
        group.add(PasswordSwitch);
        
        // Create password row
        const PasswordRow = new Adw.PasswordEntryRow({
            title: _('Enter remote server password - sshpass required'),
        });
        group.add(PasswordRow);
    
        
        // Add the settings for the page here
        //window._settings.bind('server-visible'+number, ShowServerSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);
        window._settings.bind('server-name'+number, ServerNameRow, 'text', Gio.SettingsBindFlags.DEFAULT);
        window._settings.bind('server-address'+number, RemoteAddressRow, 'text', Gio.SettingsBindFlags.DEFAULT);
        window._settings.bind('server-port'+number, RemotePortRow, 'text', Gio.SettingsBindFlags.DEFAULT);
        window._settings.bind('host-port'+number, HostPortRow, 'text', Gio.SettingsBindFlags.DEFAULT);
        window._settings.bind('server-login'+number, RemoteUserNameRow, 'text', Gio.SettingsBindFlags.DEFAULT);
        window._settings.bind('password-required'+number, PasswordSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);
        window._settings.bind('server-password'+number, PasswordRow, 'text', Gio.SettingsBindFlags.DEFAULT);
};
//End of function


export default class SSHPortForwardingPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
    
     window.default_height = 650;
     window.set_resizable(false);        
        // Import settings
        window._settings = this.getSettings();

        CreateConnection(window,'1');
        CreateConnection(window,'2');
        CreateConnection(window,'3');
        CreateConnection(window,'4');
        CreateConnection(window,'5');
    }
}
