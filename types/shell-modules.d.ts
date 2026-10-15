/**
 * Ambient declarations for the GNOME Shell JavaScript modules this extension
 * imports.
 *
 * Shell's JavaScript API has no `.gir`, so generated `@girs/*` types do not
 * cover it. Upstream maintains those types in `@girs/gnome-shell`, but its
 * GNOME 51 support (51.0.0-alpha.1) is unpublished on npm, and v50 depends on
 * St-18/Meta-18 types that conflict with the -51 packages this project uses.
 * Only the symbols actually imported here are declared; extend as needed.
 *
 * Signatures follow GNOME Shell 51. Note that in 51 `PopupMenu.open()`/`close()`
 * take a parameters object instead of the old `BoxPointer.PopupAnimation` flag.
 *
 * @see https://gitlab.gnome.org/GNOME/gnome-shell/-/tree/gnome-49/js/ui
 */

declare module "resource:///org/gnome/shell/extensions/extension.js" {
    import type Gio from "@girs/gio-2.0";

    /** Parsed contents of the extension's `metadata.json`. */
    export interface ExtensionMetadata {
        uuid: string;
        name: string;
        description: string;
        "shell-version"?: string[];
        "settings-schema"?: string;
        "gettext-domain"?: string;
        url?: string;
        [key: string]: unknown;
    }

    /**
     * Base class for an extension's `extension.js` default export.
     *
     * GNOME Shell 51 requires `disable()` to stay synchronous; returning a
     * promise now throws.
     */
    export class Extension {
        constructor(metadata: ExtensionMetadata);

        readonly metadata: ExtensionMetadata;
        readonly uuid: string;
        readonly path: string;

        /** Returns a {@link Gio.Settings} for the extension's schema. */
        getSettings(schema?: string | null, subdir?: string | null): Gio.Settings;

        /** Marks the extension's settings as translatable. */
        translateConfig(): void;

        /** Opens the extension's preferences dialog, if it has one. */
        openPreferences(): void;

        enable(): void;
        disable(): void;
    }
}

declare module "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js" {
    import type Gio from "@girs/gio-2.0";
    import type Adw from "@girs/adw-1";

    /** Marks a string for translation and returns the translation. */
    export function gettext(str: string): string;

    /** Pluralised form of {@link gettext}. */
    export function ngettext(fid: string, fidPlural: string, n: number): string;

    /** Context-sensitive form of {@link gettext}. */
    export function pgettext(context: string, str: string): string;

    /** Base class for an extension's `prefs.js` default export. */
    export class ExtensionPreferences {
        readonly metadata: Record<string, unknown>;
        readonly uuid: string;
        readonly path: string;

        /** Returns a {@link Gio.Settings} for the extension's schema. */
        getSettings(schema?: string | null, subdir?: string | null): Gio.Settings;

        /** Marks the extension's settings as translatable. */
        translateConfig(): void;

        /** Called by the shell to populate the preferences window. */
        fillPreferencesWindow(window: Adw.PreferencesWindow): Promise<void> | void;
    }
}

declare module "resource:///org/gnome/shell/ui/slider.js" {
    import type St from "@girs/st-51";

    /**
     * A draggable slider used in panel menus.
     *
     * Intersecting (rather than extending) keeps the inherited actor signal
     * overloads usable, e.g. `connect("notify::value", ...)`.
     */
    export type Slider = St.Widget & {
        /** Slider position, in the range [0, 1]. */
        value: number;
    };

    export const Slider: new (value?: number) => Slider;
}

declare module "resource:///org/gnome/shell/ui/popupMenu.js" {
    import type Clutter from "@girs/clutter-51";
    import type St from "@girs/st-51";

    /** Options accepted by {@link PopupBaseMenuItem}'s constructor. */
    export interface PopupBaseMenuItemParams {
        activate?: boolean;
        reactive?: boolean;
        sensitive?: boolean;
        canFocus?: boolean;
        hover?: boolean;
        styleClass?: string;
    }

    /**
     * Base class for every row inside a popup menu.
     *
     * These are declared as intersections with {@link St.Widget} rather than
     * interfaces extending it: a derived interface would replace the inherited
     * `connect` overloads instead of adding to them, which makes the rows
     * unassignable to parameters typed as a base menu item.
     */
    export type PopupBaseMenuItem = St.Widget & {
        /** Enables or disables the row (greys it out when disabled). */
        setSensitive(sensitive: boolean): void;
        /** Activates the row as if it had been clicked. */
        activate(): void;
    } & {
        /**
         * @param params GNOME Shell 51 passes the activation params object that
         * `open()`/`close()` also use.
         */
        connect(
            signal: "activate",
            callback: (item: PopupBaseMenuItem, params?: Record<string, unknown>) => void,
        ): number;
    };

    export const PopupBaseMenuItem: new (params?: PopupBaseMenuItemParams) => PopupBaseMenuItem;

    /** A menu row with a label. */
    export type PopupMenuItem = PopupBaseMenuItem & {
        readonly label: St.Label;
    };

    export const PopupMenuItem: new (
        label?: string | St.Label | null,
        params?: PopupBaseMenuItemParams,
    ) => PopupMenuItem;

    /** A horizontal separator row. */
    export type PopupSeparatorMenuItem = PopupBaseMenuItem;

    export const PopupSeparatorMenuItem: new () => PopupSeparatorMenuItem;

    /** A menu row with an on/off switch. */
    export type PopupSwitchMenuItem = PopupBaseMenuItem & {
        readonly state: boolean;
        setToggleState(state: boolean, animate: boolean): void;
    } & {
        connect(
            signal: "toggled",
            callback: (item: PopupSwitchMenuItem, state: boolean) => void,
        ): number;
    };

    export const PopupSwitchMenuItem: new (
        label: string | St.Label,
        active?: boolean,
        decorativeIcon?: unknown,
    ) => PopupSwitchMenuItem;

    /** The menu attached to a panel button. */
    export type PopupMenu = St.Widget & {
        readonly isOpen: boolean;

        addMenuItem(item: PopupBaseMenuItem, position?: number): void;
        removeMenuItem(item: PopupBaseMenuItem): void;
        removeAll(): void;
        addCommandLink(title: string, callback: () => void): PopupMenuItem;

        /**
         * @param params GNOME Shell 51 replaced the old `PopupAnimation` flag
         * with an object (`{ animate, fadeOnly }`).
         */
        open(params?: { animate?: boolean }): void;
        close(params?: { animate?: boolean; fadeOnly?: boolean }): void;
    };

    export const PopupMenu: new (
        sourceActor?: Clutter.Actor | null,
        arrowAlignment?: number,
        arrowSide?: number,
    ) => PopupMenu;
}

declare module "resource:///org/gnome/shell/ui/panelMenu.js" {
    import type St from "@girs/st-51";
    import type { PopupMenu } from "resource:///org/gnome/shell/ui/popupMenu.js";

    /** A button in the shell's top panel with an attached popup menu. */
    export type Button = St.Button & {
        readonly menu: PopupMenu;
    };

    /**
     * @param trackEvents whether to track button release within grab-op
     * @param name name of the actor
     * @param menuAlignment horizontal alignment of the menu, in [-1, 1]
     */
    export const Button: new (
        trackEvents?: number,
        name?: string,
        menuAlignment?: number,
    ) => Button;
}

declare module "resource:///org/gnome/shell/ui/main.js" {
    import type Gio from "@girs/gio-2.0";
    import type Meta from "@girs/meta-51";
    import type Shell from "@girs/shell-51";
    import type St from "@girs/st-51";

    /** The shell's top panel. */
    export interface Panel extends St.Widget {
        addToStatusArea(
            role: string,
            actor: St.Widget,
            priority?: number,
            boxAlign?: number,
        ): void;
    }

    /** Window management helpers exposed to extensions. */
    export interface ShellWM {
        /**
         * Registers a keybinding from an extension's schema and returns its id.
         */
        addKeybinding(
            name: string,
            settings: Gio.Settings,
            flags: Meta.KeyBindingFlags,
            mode: Shell.ActionMode,
            handler: () => void,
        ): number;

        /** Removes a keybinding previously added by this extension. */
        removeKeybinding(name: string): boolean;
    }

    /** The shell's layout manager. */
    export interface LayoutManager {
        /** Actor holding all non-window UI. */
        readonly uiGroup: St.Widget;
        /** Actor holding the window group. */
        readonly windowGroup: St.Widget;
        readonly panelBox: St.BoxLayout;
        readonly monitorManager: Meta.MonitorManager;
        readonly nMonitors: number;
    }

    /** The overview (window overview + search). */
    export interface Overview extends St.Widget {
        connect(signal: "showing" | "hiding" | "show-overview", callback: () => void): number;
    }

    export const panel: Panel;
    export const wm: ShellWM;
    export const layoutManager: LayoutManager;
    export const overview: Overview;

    /** Shows a notification in the message tray. */
    export function notify(message: string): void;
}
