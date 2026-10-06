"""Inline fonts, the reel script and the soundtrack into single-file HTML pages."""
import base64
import pathlib
import sys

SRC = pathlib.Path(__file__).resolve().parent
ROOT = SRC.parent


def b64(path):
    return base64.b64encode(path.read_bytes()).decode()


def build(template, out, with_audio=True):
    html = (SRC / template).read_text()
    audio = SRC / "audio" / "soundtrack.m4a"
    subs = {
        "{{FONT_ARCHIVO}}": b64(SRC / "fonts" / "archivo.woff2"),
        "{{FONT_INSTRUMENT_ITALIC}}": b64(SRC / "fonts" / "instrument-italic.woff2"),
        "{{FONT_JBMONO}}": b64(SRC / "fonts" / "jbmono.woff2"),
        "{{AUDIO}}": "data:audio/mp4;base64," + b64(audio) if with_audio and audio.exists() else "",
        "{{REEL_JS}}": (SRC / "reel.js").read_text(),
    }
    for key, value in subs.items():
        html = html.replace(key, value)
    (ROOT / out).write_text(html)
    print(f"wrote {out} ({len(html) / 1024:.0f} KB)")


if __name__ == "__main__":
    build("reel.template.html", "reel.html", with_audio="--no-audio" not in sys.argv)
    if (SRC / "mockup.template.html").exists():
        build("mockup.template.html", "mockup.html", with_audio=False)
