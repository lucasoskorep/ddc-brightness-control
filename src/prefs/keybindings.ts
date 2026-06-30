import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import { gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export class KeybindingEntryRow extends Adw.EntryRow {
    static {
        GObject.registerClass(this);
    }

    constructor(params: {
        title: string,
        settings: Gio.Settings,
        bind: string,
    }) {
        super({ title: params.title });

        const { settings, bind } = params;

        this.connect('changed', () => {
            const text = this.get_text();
            if (typeof text === 'string') {
                if (text.trim() === '') {
                    settings.set_strv(bind, []);
                } else {
                    const parts = text.split(',').map(s => s.trim()).filter(s => s);
                    settings.set_strv(bind, parts);
                }
            }
        });

        const current = settings.get_strv(bind).join(',');
        this.set_text(current ?? '');

        this.add_suffix(
            new ResetButton({
                settings,
                bind,
                onReset: () => {
                    this.set_text(settings.get_strv(bind).join(',') ?? '');
                },
            }),
        );
    }
}

class ResetButton extends Gtk.Button {
    static {
        GObject.registerClass(this);
    }

    constructor(params: {
        settings?: Gio.Settings,
        bind: string,
        onReset?: () => void,
    }) {
        super({
            icon_name: 'edit-clear-symbolic',
            tooltip_text: _('Reset'),
            valign: Gtk.Align.CENTER,
        });

        this.connect('clicked', () => {
            params.settings?.reset(params.bind);
            params.onReset?.();
        });
    }
}
