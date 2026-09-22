# -*- coding: utf-8 -*-
"""
Genera src/index-stt.html a partir de src/index.html, agregando el logo
corporativo en el encabezado.

    python tools/generar-version-marca.py

Por qué existe: el proyecto no tiene build step (es una decisión, ver
CLAUDE.md), así que la versión con marca es un archivo real y no algo que se
arma al vuelo. Como dos HTML se desincronizan solos, este script rehace la
copia desde el original. **Correrlo después de cada cambio en index.html.**

Comparte todo lo demás con la versión neutra: mismo app.js, mismos estilos,
mismos diccionarios. Lo único que cambia es el encabezado.
"""
import io
import os
import sys

# La consola de Windows suele venir en cp1252 y revienta con simbolos
# fuera de ese juego: se fuerza UTF-8 y los mensajes van en ASCII.
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIGEN = os.path.join(RAIZ, "src", "index.html")
DESTINO = os.path.join(RAIZ, "src", "index-stt.html")
LOGO = "logo-stt.png"

MARCA_INICIO = "<!-- logo corporativo: generado por tools/generar-version-marca.py -->"

BLOQUE = f'''        {MARCA_INICIO}
        <img class="brand-logo" src="{LOGO}" width="131" height="96" alt="STT Group" />
'''


def generar():
    if not os.path.exists(ORIGEN):
        sys.exit(f"No encuentro {ORIGEN}")
    if not os.path.exists(os.path.join(RAIZ, "src", LOGO)):
        sys.exit(f"Falta src/{LOGO}")

    html = io.open(ORIGEN, encoding="utf-8").read()

    if MARCA_INICIO in html:
        sys.exit("index.html ya trae el logo: este script parte de la versión neutra.")

    # El logo va al final del encabezado, después de los controles.
    ancla = "      </div>\n    </header>"
    if html.count(ancla) != 1:
        sys.exit("No pude ubicar el cierre del encabezado sin ambigüedad.")
    html = html.replace(ancla, BLOQUE + ancla, 1)

    # Aviso para quien abra el archivo generado.
    html = html.replace(
        "<!DOCTYPE html>",
        "<!DOCTYPE html>\n<!-- ARCHIVO GENERADO — no editar a mano.\n"
        "     Se rehace con: python tools/generar-version-marca.py\n"
        "     Editá src/index.html y volvé a correr el script. -->",
        1,
    )

    return html


def escribir():
    html = generar()
    io.open(DESTINO, "w", encoding="utf-8", newline="\n").write(html)
    print(f"Generado {os.path.relpath(DESTINO, RAIZ)} ({len(html)} caracteres)")


def verificar():
    """Falla si la copia con marca quedó desactualizada respecto del original."""
    esperado = generar()
    if not os.path.exists(DESTINO):
        sys.exit("[ERROR] Falta src/index-stt.html. Correr: python tools/generar-version-marca.py")
    actual = io.open(DESTINO, encoding="utf-8").read()
    if actual != esperado:
        sys.exit("[ERROR] src/index-stt.html quedo desincronizado de index.html.\n"
                 "  Rehacerlo con: python tools/generar-version-marca.py")
    print("[OK] La version con marca esta al dia con index.html.")


if __name__ == "__main__":
    if "--verificar" in sys.argv:
        verificar()
    else:
        escribir()
