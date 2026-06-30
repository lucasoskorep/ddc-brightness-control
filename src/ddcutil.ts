import Gio from 'gi://Gio';
import { LOG_PREFIX, DDCUTIL_SLEEP_MULTIPLIER } from './constants.js';

/** A display as parsed from `ddcutil detect`, before any state is attached. */
export interface ParsedDisplay {
    bus: string;
    name: string;
    connector: string;
}

// Run a command asynchronously, capturing stdout. The callback always fires:
// with stdout on success, or an empty string on failure.
export function runCommandAsync(args: string[], callback: (stdout: string) => void): void {
    try {
        const subprocess = new Gio.Subprocess({
            argv: args,
            flags: Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE,
        });
        subprocess.init(null);

        subprocess.communicate_utf8_async(null, null, (proc: Gio.Subprocess | null, result: Gio.AsyncResult) => {
            try {
                const [, stdout] = (proc ?? subprocess).communicate_utf8_finish(result);
                callback(stdout);
            } catch (e) {
                console.error(`${LOG_PREFIX} Command failed: ${e}`);
                callback('');
            }
        });
    } catch (e) {
        console.error(`${LOG_PREFIX} Failed to spawn: ${e}`);
    }
}

// Detect connected DDC displays and return them parsed.
export function detectDisplays(callback: (displays: ParsedDisplay[]) => void): void {
    runCommandAsync(['ddcutil', 'detect', '--brief'], (stdout: string) => {
        callback(parseDisplays(stdout));
    });
}

// Parse the output of `ddcutil detect --brief` into a list of displays.
export function parseDisplays(stdout: string): ParsedDisplay[] {
    const displays: ParsedDisplay[] = [];
    const blocks = stdout.split(/^Display\s+\d+/m);

    for (const block of blocks) {
        if (!block.trim()) continue;

        const busMatch = block.match(/I2C bus:\s+\/dev\/i2c-(\d+)/);
        const monitorMatch = block.match(/Monitor:\s+(.+)/);
        const connectorMatch = block.match(/DRM connector:\s+card\d+-(\S+)/);

        if (busMatch) {
            const bus = busMatch[1];
            const name = monitorMatch ? monitorMatch[1].trim() : `Display (bus ${bus})`;
            const connector = connectorMatch ? connectorMatch[1] : '';
            displays.push({ bus, name, connector });
        }
    }

    return displays;
}

// Read the current brightness (0-100) for a bus, or null if unreadable.
export function readBrightness(bus: string, vcpCode: string, callback: (value: number | null) => void): void {
    runCommandAsync(
        ['ddcutil', 'getvcp', vcpCode, '--bus', bus, '--brief', '--sleep-multiplier', DDCUTIL_SLEEP_MULTIPLIER],
        (stdout: string) => {
            const match = stdout.match(/VCP\s+\w+\s+\w+\s+(\d+)\s+(\d+)/);
            callback(match ? parseInt(match[1]) : null);
        },
    );
}

// Set the brightness (0-100) for a bus. `callback` fires when the write
// completes (success or failure), so callers can chain the next write.
// `--noverify` skips ddcutil's post-write read-back for speed.
export function setBrightness(bus: string, vcpCode: string, value: number, callback: () => void): void {
    runCommandAsync(
        ['ddcutil', 'setvcp', vcpCode, String(value), '--bus', bus, '--noverify', '--sleep-multiplier', DDCUTIL_SLEEP_MULTIPLIER],
        () => callback(),
    );
}
