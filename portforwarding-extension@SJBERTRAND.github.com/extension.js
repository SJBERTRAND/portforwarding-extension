/* extension.js
 *
 *https://github.com/SJBERTRAND/portforwarding-extension
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



const SSHServerConnection = class {
    constructor() {

    };
    
    _createSwitches(_settings,_menu,_number,_icon,_cancellable,_section){
            
        //When switches are created set all server visible value to false
        _settings.set_boolean('connection-active'+_number, false);
        
       // Connect to value changes and update icons
       _settings.connect('changed::connection-active'+_number, ()=> {
        
                
                if (_settings.get_boolean('connection-active1') || _settings.get_boolean('connection-active2') || _settings.get_boolean('connection-active3') || _settings.get_boolean('connection-active4') || _settings.get_boolean('connection-active5') ){
                    _icon.icon_name = 'network-transmit-receive-symbolic';
                }else{
                    _icon.icon_name = 'network-offline-symbolic';
                };      
       });       
       
        const _switch = this._buildSwitch(_settings,_number,_cancellable);
        _section.addMenuItem(_switch,_number);
        //_menu.addMenuItem(_switch,_number);
        
        
        // Signal to destroy the switch if turned off
        
        _settings.connect('changed::show-connection'+_number, ()=> {
            if ( _settings.get_boolean('show-connection'+_number) == false ){
                _switch.destroy();
            };
        }); //End of signal
        
        
    }; // end of Create switch
    
    
    
    _buildSwitch(_settings,_number,_cancellable){

        //Create the switch
        const _switch =  new PopupMenu.PopupSwitchMenuItem(_(_settings.get_string('server-name'+_number)), false);
        
        // Bind the value of connection-name to the ConnectionSwitch label text value
        _settings.bind('server-name'+_number, _switch.label, 'text', Gio.SettingsBindFlags.DEFAULT);
        
        // Create a variable for the subprocess
        var _subprocess = null;
        
        // Create the switch signal that build and execute the command when switch to on
        _switch.connect('toggled', () =>{
        
            if ( _switch.state == true){
            
                const _command = this._buildCommand(_settings,_number);
                
                // Assign Gio.Subprocess to the _subprocess of the switch
                _subprocess = Gio.Subprocess.new(_command, Gio.SubprocessFlags.NONE);
                               
                //  Connect the switch to the subprocess
                _subprocess._switch = _switch;
                
                // Connect the settings to the subprocess
                _subprocess._settings =  _settings;
                
                // Connec the number to subprocess
                
                _subprocess._number = _number;
 
                // Initialized the SSH connection and call _subprocessCompleted when it fails or get terminated
                _subprocess.wait_async(_cancellable,this._subprocessCompleted);
    
                // Change the value to change the icon
                _settings.set_boolean('connection-active'+_number, true);
                
            
            }; //End if statement for switch state true
            
            if ( _switch.state == false){
            
                if ( _subprocess != null ) {
                    _subprocess.force_exit();
                    _subprocess = null;
                };
                _settings.set_boolean('connection-active'+_number, false);
                            
            }; //End if statement for switch state false
            
        

        }); //End of switch signal        
        return _switch;
    }; //End of build switch
    
    
    
    _buildCommand(_settings,_number){
    
    const CommandArray = [];
        if (_settings.get_boolean('password-required'+_number) == true) {
            CommandArray.push('sshpass', '-p', _settings.get_string('server-password'+_number), 'ssh' , '-p' , _settings.get_string('ssh-port'+_number) ,'-N' , '-o', 'ConnectTimeout=10');
        }else{
            CommandArray.push('ssh' , '-p' , _settings.get_string('ssh-port'+_number) ,'-N', '-o', 'PasswordAuthentication=no' , '-o' , 'BatchMode=true', '-o', 'ConnectTimeout=10');
        };

        // Create an array of all the ports
        const regex = /[0-9]*[0-9]/g;
        const RemotePorts = _settings.get_string('server-port'+_number).match(regex);
        const HostPorts = _settings.get_string('host-port'+_number).match(regex);

        RemotePorts.forEach(ports => {
            // Find position of item in first array
            var Position = RemotePorts.indexOf(ports);
            //Look that there is a second port otherwise use the first one
                if ( HostPorts.at(Position) == undefined ) {
                    CommandArray.push('-L', ports+':'+_settings.get_string('server-address'+_number)+':'+ports );
                }else {
                    CommandArray.push('-L', HostPorts.at(Position)+':'+_settings.get_string('server-address'+_number)+':'+ports );
                };
        });

        CommandArray.push( _settings.get_string('server-login'+_number)+'@'+_settings.get_string('server-address'+_number));
        
        return CommandArray
    }; //End of build command


    _subprocessCompleted(_subprocess, _result){
        _subprocess._switch.setToggleState(false);
        _subprocess._settings.set_boolean('connection-active'+_subprocess._number, false);

        if ( _subprocess.get_exit_status() != 1 ){
            Main.notify( 'Port Forwarding Extension - Unable to establish SSH connection' ,'Check '+_subprocess._settings.get_string('server-name'+_subprocess._number)+' settings' );
        };

        if ( _subprocess != null ) {
            _subprocess.force_exit();
            _subprocess = null;
        };       
    }; //End of _subprocessCompleted


}; // End of constructor




const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {

    destroy(){
        this._cancellable.cancel();
        super.destroy();
        };


    _init(_settings,_sshForwarding) {
        super._init(0.0, _('SSH Port Forwarding Extension'));
        
        this._settings = _settings;
        
        
        this._icon = new St.Icon({
            icon_name: 'network-offline-symbolic',
            style_class: 'system-status-icon',
            });
        this.add_child(this._icon);
        
        this._cancellable = new Gio.Cancellable();
        
        
        // Create a Section
        const _section = new PopupMenu.PopupMenuSection();
        this.menu.addMenuItem(_section);
        
        
        if ( this._settings.get_boolean('show-connection1') == true ){
            _sshForwarding._createSwitches(this._settings,this.menu,1,this._icon,this._cancellable,_section);
        };
        this._settings.connect('changed::show-connection1', ()=> {
            if ( this._settings.get_boolean('show-connection1') == true ){
        _sshForwarding._createSwitches(this._settings,this.menu,1,this._icon,this._cancellable,_section);
            };
        }); //End of signal
            
        if ( this._settings.get_boolean('show-connection2') == true ){
            _sshForwarding._createSwitches(this._settings,this.menu,2,this._icon,this._cancellable,_section);
            };
        this._settings.connect('changed::show-connection2', ()=> {
            if ( this._settings.get_boolean('show-connection2') == true ){
        _sshForwarding._createSwitches(this._settings,this.menu,2,this._icon,this._cancellable,_section);
            };
        }); //End of signal
        
        
        if ( this._settings.get_boolean('show-connection3') == true ){
            _sshForwarding._createSwitches(this._settings,this.menu,3,this._icon,this._cancellable,_section);
            };
        this._settings.connect('changed::show-connection3', ()=> {
            if ( this._settings.get_boolean('show-connection3') == true ){
        _sshForwarding._createSwitches(this._settings,this.menu,3,this._icon,this._cancellable,_section);
            };
        }); //End of signal
        
        
        if ( this._settings.get_boolean('show-connection4') == true ){
            _sshForwarding._createSwitches(this._settings,this.menu,4,this._icon,this._cancellable,_section);
            };
        this._settings.connect('changed::show-connection4', ()=> {
            if ( this._settings.get_boolean('show-connection4') == true ){
        _sshForwarding._createSwitches(this._settings,this.menu,4,this._icon,this._cancellable,_section);
            };
        }); //End of signal
         
        if ( this._settings.get_boolean('show-connection5') == true ){
                _sshForwarding._createSwitches(this._settings,this.menu,5,this._icon,this._cancellable,_section);
            };
        this._settings.connect('changed::show-connection5', ()=> {
            if ( this._settings.get_boolean('show-connection5') == true ){
                _sshForwarding._createSwitches(this._settings,this.menu,5,this._icon,this._cancellable,_section);
            };
        }); //End of signal
    }
});


export default class SSHPortForwardingExtension extends Extension {
    enable() {
        //Get the settings saved from the preferences
        this._settings = this.getSettings();
        this._sshForwarding = new SSHServerConnection();
        this._indicator = new Indicator(this._settings,this._sshForwarding);
        Main.panel.addToStatusArea(this.uuid, this._indicator);
        
        //Add a menu item to open the preferences window
        this._indicator.menu.addAction(_('Connection Settings',6),
            () => this.openPreferences());    
    }

    disable() {
        // Cancel all subprocess      
        this._sshForwarding = null;
        this._indicator.destroy();
        this._indicator = null;
        this._settings = null;
    }
}

