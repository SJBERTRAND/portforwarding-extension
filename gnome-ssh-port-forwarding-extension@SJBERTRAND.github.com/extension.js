/* extension.js
 *
 *https://github.com/SJBERTRAND/gnome-ssh-port-forwarding-extension
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

import GObject from 'gi://GObject';
import St from 'gi://St';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';



const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init(_settings) {
        super._init(0.0, _('SSH Port Forwarding Extension'));
        
        const _icon_on = 'network-transmit-receive-symbolic';
        const _icon_off = 'network-offline-symbolic';
        
        let _icon = new St.Icon({
            icon_name: _icon_off,
            style_class: 'system-status-icon',
            });
        
        this.add_child(_icon);

        // Create new switch item
        let ConnectionSwitch = new PopupMenu.PopupSwitchMenuItem(_(_settings.get_string('connection-name')), false);
        // Bind the value of connection-name to the ConnectionSwitch label text value
        _settings.bind('connection-name', ConnectionSwitch.label, 'text', Gio.SettingsBindFlags.DEFAULT);
        
        // Create the _SubProcess property
        this._SubProcess = null;
        
        //Connect to the switch and active the connection when on and deactivate when off
        ConnectionSwitch.connect('toggled' , () =>{
            if (ConnectionSwitch.state == true){
            // update the icon
            _icon.icon_name = _icon_on;
            
            //Create a function to verify if the subprocess has succeded
            function CheckFail(){
                if (proc.get_successful() == false){
                        ConnectionSwitch.setToggleState(false);
                        _icon.icon_name = _icon_off;
                        //Main.notify("Connection with "+_settings.get_string('connection-name')+" failed");
                        };
                };
                    
            //Create a subprocess to Call SSH based on if password is required
            this._Command = null;
            
            if( _settings.get_boolean('pass-required') ){
            this._Command = [ "/usr/bin/sshpass", "-p" , _settings.get_string('remote-password') , "ssh" ,"-N" ,"-L", _settings.get_string('host-port')+":"+_settings.get_string('host-address')+":"+_settings.get_string('remote-port') , _settings.get_string('remote-login')+"@"+_settings.get_string('remote-address') ];
            }else{
            this._Command = [ "/usr/bin/ssh" ,"-N" ,"-L", _settings.get_string('host-port')+":"+_settings.get_string('host-address')+":"+_settings.get_string('remote-port') , _settings.get_string('remote-login')+"@"+_settings.get_string('remote-address') ];
            };
            
            
            // Attach the subprocess to the indicator with a new properties/value of _SubProcess 
            this._SubProcess = Gio.Subprocess.new(this._Command, Gio.SubprocessFlags.NONE); // When finish switch to STDOUT_SILENCE
            const proc = this._SubProcess;
            const cancellable = new Gio.Cancellable();
            this._SubProcess.wait_async(cancellable,CheckFail);

            }; // End of if statement if true
            
            if (ConnectionSwitch.state == false){
            //update icon
            _icon.icon_name = _icon_off;
                    if ( this._SubProcess != null){
                        this._SubProcess.force_exit();
                        this._SubProcess = null;
                        };
            };
        });
        
         
        //Add the switch to the menu
        this.menu.addMenuItem(ConnectionSwitch);

    }
});

export default class SSHPortForwardingExtension extends Extension {
    enable() {
        //Get the settings saved from the preferences
        this._settings = this.getSettings();
        // Create the indicator and passed the settings to it so it can be used while creating widget inside the indicator
        this._indicator = new Indicator(this._settings);
        Main.panel.addToStatusArea(this.uuid, this._indicator);
        
         // Add a menu item to open the preferences window
        this._indicator.menu.addAction(_('Connection Settings'),
            () => this.openPreferences());
        
    }

    disable() {
        if ( this._indicator._SubProcess != null ){
            this._indicator._SubProcess.force_exit();
            this._indicator._SubProcess = null;
        };
        this._indicator.destroy();
        this._indicator = null;
        this._settings = null;
    }
}
