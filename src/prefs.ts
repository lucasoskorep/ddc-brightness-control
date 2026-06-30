import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import { KeybindingEntryRow } from './prefs/keybindings.js';

const SCHEMA_ID = 'org.gnome.shell.extensions.ddcbrightness';

export default class DDCCBrightnessPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window: Adw.PreferencesWindow): Promise<void> {
        const settings = this.getSettings(SCHEMA_ID);

        const page = new Adw.PreferencesPage({
            title: _('DDC Brightness Control'),
            iconName: 'display-symbolic',
        });

        const ddcGroup = new Adw.PreferencesGroup({
            title: _('DDC Settings'),
            description: _('DDC/CI configuration'),
        });
        page.add(ddcGroup);

        const vcpCode = new Adw.EntryRow({
            title: _('VCP Code'),
        });
        vcpCode.set_text(settings.get_string('vcp-code') ?? '10');
        ddcGroup.add(vcpCode);

        const step = new Adw.SpinRow({
            title: _('Step Size'),
            subtitle: _('Brightness change per key press (1-20%)'),
            adjustment: new Gtk.Adjustment({
                lower: 1,
                upper: 20,
                stepIncrement: 1,
            }),
        });
        ddcGroup.add(step);

        const linkDisplays = new Adw.SwitchRow({
            title: _('Link Displays'),
            subtitle: _('Link brightness of all displays so they move together'),
        });
        ddcGroup.add(linkDisplays);

        const keybindingGroup = new Adw.PreferencesGroup({
            title: _('Keyboard Shortcuts'),
            description: _('Syntax: <Super>h, <Shift>g, <Super><Shift>h\nLegend: <Super> - Windows key, <Primary> - Control key\nDelete text to unset. Press Return key to accept.'),
        });
        page.add(keybindingGroup);

        keybindingGroup.add(
            new KeybindingEntryRow({
                title: _('Brightness Up'),
                settings: settings,
                bind: 'brightness-up',
            }),
        );

        keybindingGroup.add(
            new KeybindingEntryRow({
                title: _('Brightness Down'),
                settings: settings,
                bind: 'brightness-down',
            }),
        );

        settings.bind('vcp-code', vcpCode, 'text', Gio.SettingsBindFlags.DEFAULT);
        settings.bind('step', step, 'value', Gio.SettingsBindFlags.DEFAULT);
        settings.bind('link-displays', linkDisplays, 'active', Gio.SettingsBindFlags.DEFAULT);

        window.add(page);
        return Promise.resolve();
    }
}
