"""Copy the live site's content into this test repo, so the test site shows real content and only
code changes differ. Copies news, members and publications (plus any images they use that are
missing here). Never touches HTML, CSS or JavaScript.

Run by .github/workflows/sync-from-live.yml ("Sync content from live site" on the Actions tab),
or locally:  python .github/sync_from_live.py"""
import json
import os
import re
import urllib.request

LIVE = "https://raw.githubusercontent.com/KareemOK/schmittlab/main/"
CONTENT = ["news.json", "members.json", "publications.bib", "publications.json"]

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))


def fetch(path):
    with urllib.request.urlopen(LIVE + urllib.request.quote(path), timeout=60) as r:
        return r.read()


changed = []
for name in CONTENT:
    data = fetch(name)
    old = open(name, "rb").read() if os.path.exists(name) else b""
    if data.replace(b"\r\n", b"\n") != old.replace(b"\r\n", b"\n"):
        open(name, "wb").write(data)
        changed.append(name)

# images referenced by the content files that this repo doesn't have yet
text = "".join(open(n, encoding="utf-8").read() for n in ("news.json", "members.json"))
for path in sorted(set(re.findall(r'"(assets/[^"]+)"', text))):
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        open(path, "wb").write(fetch(path))
        changed.append(path)

print("Updated from live:", ", ".join(changed) if changed else "nothing (already in sync)")
