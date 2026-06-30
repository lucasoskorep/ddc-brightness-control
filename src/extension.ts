import Gio from 'gi://Gio';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {Extension, ExtensionMetadata} from 'resource:///org/gnome/shell/extensions/extension.js';
import { ROLE, SCHEMA_ID, LOG_PREFIX } from './constants.js';
import { DisplayController } from './displays.js';
import { KeybindingManager } from './keybindings.js';
import { BrightnessIndicator } from './indicator.js';

export default class DDCCBrightness extends Extension {
    private _settings: Gio.Settings | null = null;
    private _controller: DisplayController | null = null;
    private _indicator: BrightnessIndicator | null = null;
    private _keybindings: KeybindingManager | null = null;

    constructor(metadata: ExtensionMetadata) {
        super(metadata);
    }

    enable() {
        console.log(`${LOG_PREFIX} Enabling extension`);

        this._settings = this.getSettings(SCHEMA_ID);

        this._controller = new DisplayController(this._settings);
        this._controller.onDetectComplete = () => this._indicator?.rebuildMenu();

        this._indicator = new BrightnessIndicator({
            controller: this._controller,
            settings: this._settings,
            onRefresh: () => {
                this._controller!.reset();
                this._indicator!.rebuildMenu();
                this._controller!.detect();
            },
            onOpenPrefs: () => this.openPreferences(),
        });
        Main.panel.addToStatusArea(ROLE, this._indicator.button);

        this._controller.detect();

        this._keybindings = new KeybindingManager(this._settings, {
            'brightness-up':   () => this._controller!.adjustDelta(1),
            'brightness-down': () => this._controller!.adjustDelta(-1),
        });
        this._keybindings.enable();
    }

    disable() {
        console.log(`${LOG_PREFIX} Disabling extension`);

        this._keybindings?.disable();
        this._keybindings = null;

        this._controller?.cleanup();
        this._indicator?.destroy();

        this._controller = null;
        this._indicator = null;
        this._settings = null;
    }
}
