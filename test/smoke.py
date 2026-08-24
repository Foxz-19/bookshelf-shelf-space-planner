from atexit import register
from http.server import SimpleHTTPRequestHandler as H,ThreadingHTTPServer as S
from threading import Thread
from playwright.sync_api import sync_playwright as P
s=S(("127.0.0.1",4173),H);Thread(target=s.serve_forever,daemon=True).start();register(s.shutdown)
with P()as p:
 b=p.chromium.launch(headless=True);q=b.new_page(viewport={"width":1280,"height":800});e=[];q.on("pageerror",lambda x:e.append(str(x)));q.goto("http://127.0.0.1:4173",wait_until="networkidle");q.evaluate("localStorage.clear()");q.reload(wait_until="networkidle")
 q.locator("#plant-name").fill("Monstera");q.locator("#nickname").fill("Moss");q.locator("#frequency").fill("4");q.locator("#note").fill("Rotate toward the window");q.get_by_role("button",name="Add to collection").click();assert q.get_by_role("heading",name="Monstera").is_visible();assert "due in"in q.locator("#plant-list").inner_text().lower()
 q.get_by_role("button",name="Edit").click();assert q.locator("#last-watered").input_value();q.locator("#frequency").fill("5");q.get_by_role("button",name="Save Monstera").click();assert "Every 5 days"in q.locator("#plant-list").inner_text();q.get_by_role("button",name="Water now").click();assert "Next up:"in q.locator("#notices").inner_text();q.reload(wait_until="networkidle");assert q.get_by_role("heading",name="Monstera").is_visible()
 q.get_by_role("button",name="Remove Monstera").click();q.get_by_role("button",name="Remove plant").click();q.get_by_text("Your shelf is waiting.").wait_for();assert "Your shelf is waiting"in q.locator("#plant-list").inner_text();q.set_viewport_size({"width":390,"height":844});assert q.get_by_role("button",name="Night view").is_visible()
 x=b.new_page();x.add_init_script("Storage.prototype.setItem=()=>{throw 0}");x.goto("http://127.0.0.1:4173",wait_until="networkidle");x.locator("#plant-name").fill("Unsaved");x.get_by_role("button",name="Add to collection").click();assert "Could not save changes"in x.locator("#form-error").inner_text();assert x.get_by_role("heading",name="Unsaved").count()==0;x.close();assert not e,e;b.close()
