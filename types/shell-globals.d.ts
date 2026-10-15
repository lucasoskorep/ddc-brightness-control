/**
 * GNOME Shell runtime globals.
 *
 * The `global` object is created by the shell before an extension is loaded and
 * has no `.gir`, so it is not covered by the generated `@girs/*-51` packages.
 * Upstream ships these in `@girs/gnome-shell`, but its GNOME 51 build
 * (51.0.0-alpha.1) is unpublished, and v50 pulls St-18/Meta-18 types that
 * collide with the -51 packages. Declaring the few symbols we use keeps the
 * project on GNOME 51 types and installable from the registry.
 *
 * @see https://gitlab.gnome.org/GNOME/gnome-shell/-/blob/main/js/ui/environment.js
 */
import type Shell from "@girs/shell-51";

declare global {
    /** Global shell object created by GNOME Shell on startup. */
    const global: Shell.Global;
}

export {};
