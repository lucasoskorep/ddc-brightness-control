import Gio from 'gi://Gio';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

/** Map of settings key -> callback to run when the shortcut fires. */
export type KeybindingActions = Record<string, () => void>;

/**
 * Registers the extension's keyboard shortcuts with the window manager and
 * keeps them in sync as their settings change.
 */
export class KeybindingManager {
    private _settings: Gio.Settings;
    private _actions: KeybindingActions;
    private _bindings: Map<string, number> = new Map();

    constructor(settings: Gio.Settings, actions: KeybindingActions) {
        this._settings = settings;
        this._actions = actions;
    }

    enable(): void {
        for (const [name, callback] of Object.entries(this._actions)) {
            this._bind(name, callback);
        }

        for (const name of Object.keys(this._actions)) {
            this._settings.connect(`changed::${name}`, () => {
                this._refresh(name);
            });
        }
    }

    disable(): void {
        this._bindings.forEach((_, key) => {
            Main.wm.removeKeybinding(key);
        });
        this._bindings.clear();
    }

    private _bind(settingName: string, callback: () => void): void {
        const keyBindingSettings = this._settings.get_strv(settingName);
        if (keyBindingSettings.length === 0 || keyBindingSettings[0] === '') {
            return;
        }

        const action = Main.wm.addKeybinding(
            settingName,
            this._settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.NORMAL,
            callback,
        );
        this._bindings.set(settingName, action);
    }

    private _refresh(settingName: string): void {
        if (this._bindings.has(settingName)) {
            Main.wm.removeKeybinding(settingName);
            this._bindings.delete(settingName);
        }

        const action = this._actions[settingName];
        if (action) this._bind(settingName, action);
    }
}
