"""Read public guestbook entries; never sign in or submit a message."""
import json
import pathlib
import urllib.request
from bs4 import BeautifulSoup

url = "https://teicheir.atabook.org/"
request = urllib.request.Request(url, headers={"User-Agent": "Teicheir-public-guestbook/1.0"})
with urllib.request.urlopen(request, timeout=30) as response:
    soup = BeautifulSoup(response.read(), "html.parser")
entries = []
for message in soup.select("#messages .message"):
    text = message.select_one(".message-text")
    if text is None:
        continue
    header = message.select_one(".split")
    author = "Guest"
    if header:
        name = header.find("div", recursive=False)
        if name:
            for stamp in name.select(".message-time, .message-num"):
                stamp.decompose()
            author = name.get_text(" ", strip=True) or "Guest"
    entries.append({"name": author[:100], "message": text.get_text("\n", strip=True)[:10000]})
if not entries and "No messages yet" not in soup.get_text():
    raise RuntimeError("Guestbook markup changed; preserve the previous public snapshot.")
target = pathlib.Path(__file__).resolve().parents[1] / "data" / "guestbook.json"
target.write_text(json.dumps({"entries": entries}, ensure_ascii=False), encoding="utf-8")
print(f"Read {len(entries)} public guestbook entries.")
