set dotenv-load
NAME:="ddcbrightness"
DOMAIN:="lucaso.io"
FULL_NAME:=NAME + "@" + DOMAIN

packages:
	pnpm install

build: packages && build-schemas
    rm -rf dist/*
    pnpm run build
    cp metadata.json dist/
    cp stylesheet.css dist/
    mkdir -p dist/schemas

build-schemas:
    glib-compile-schemas schemas
    cp schemas/org.gnome.shell.extensions.ddcbrightness.gschema.xml dist/schemas/
    cp schemas/gschemas.compiled dist/schemas/

build-package: build
	rm -f {{NAME}}.zip
	cd dist && zip ../{{NAME}}.zip -9r . -x ./schemas/gschemas.compiled


install: build
	mkdir -p ~/.local/share/gnome-shell/extensions/{{NAME}}@{{DOMAIN}}
	rm -rf ~/.local/share/gnome-shell/extensions/{{NAME}}@{{DOMAIN}}/*
	cp -r dist/* ~/.local/share/gnome-shell/extensions/{{NAME}}@{{DOMAIN}}/

run:
    env MUTTER_DEBUG_DUMMY_MODE_SPECS=1280x720 dbus-run-session -- gnome-shell --devkit --wayland

install-and-run: install run

live-debug:
    journalctl /usr/bin/gnome-shell -f -o cat | tee debug.log

lint:
    pnpm run lint

lint-fix:
    pnpm run lint --fix

clean:
    pnpm run clean

analyze: build-package
    uv pip install -U shexli
    uv run shexli ddcbrightness.zip

