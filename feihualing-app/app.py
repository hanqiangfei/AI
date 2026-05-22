from __future__ import annotations

from dataclasses import dataclass, asdict
from difflib import SequenceMatcher
import json
import random
from http import cookies
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import re
import secrets
from typing import Dict, List, Optional
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).parent
HOST = "0.0.0.0"
PORT = 5000


@dataclass(frozen=True)
class PoemLine:
    line: str
    title: str
    author: str
    dynasty: str


POEMS: List[PoemLine] = [
    PoemLine("海内存知己，天涯若比邻", "送杜少府之任蜀州", "王勃", "唐"),
    PoemLine("大漠孤烟直，长河落日圆", "使至塞上", "王维", "唐"),
    PoemLine("会当凌绝顶，一览众山小", "望岳", "杜甫", "唐"),
    PoemLine("烽火连三月，家书抵万金", "春望", "杜甫", "唐"),
    PoemLine("感时花溅泪，恨别鸟惊心", "春望", "杜甫", "唐"),
    PoemLine("沉舟侧畔千帆过，病树前头万木春", "酬乐天扬州初逢席上见赠", "刘禹锡", "唐"),
    PoemLine("山重水复疑无路，柳暗花明又一村", "游山西村", "陆游", "宋"),
    PoemLine("人生自古谁无死，留取丹心照汗青", "过零丁洋", "文天祥", "宋"),
    PoemLine("不畏浮云遮望眼，自缘身在最高层", "登飞来峰", "王安石", "宋"),
    PoemLine("但愿人长久，千里共婵娟", "水调歌头", "苏轼", "宋"),
    PoemLine("人有悲欢离合，月有阴晴圆缺", "水调歌头", "苏轼", "宋"),
    PoemLine("乱花渐欲迷人眼，浅草才能没马蹄", "钱塘湖春行", "白居易", "唐"),
    PoemLine("几处早莺争暖树，谁家新燕啄春泥", "钱塘湖春行", "白居易", "唐"),
    PoemLine("夕阳西下，断肠人在天涯", "天净沙·秋思", "马致远", "元"),
    PoemLine("枯藤老树昏鸦，小桥流水人家", "天净沙·秋思", "马致远", "元"),
    PoemLine("采菊东篱下，悠然见南山", "饮酒", "陶渊明", "东晋"),
    PoemLine("问君何能尔，心远地自偏", "饮酒", "陶渊明", "东晋"),
    PoemLine("长风破浪会有时，直挂云帆济沧海", "行路难", "李白", "唐"),
    PoemLine("我寄愁心与明月，随君直到夜郎西", "闻王昌龄左迁龙标遥有此寄", "李白", "唐"),
    PoemLine("忽如一夜春风来，千树万树梨花开", "白雪歌送武判官归京", "岑参", "唐"),
    PoemLine("瀚海阑干百丈冰，愁云惨淡万里凝", "白雪歌送武判官归京", "岑参", "唐"),
    PoemLine("落红不是无情物，化作春泥更护花", "己亥杂诗", "龚自珍", "清"),
    PoemLine("春蚕到死丝方尽，蜡炬成灰泪始干", "无题", "李商隐", "唐"),
    PoemLine("商女不知亡国恨，隔江犹唱后庭花", "泊秦淮", "杜牧", "唐"),
    PoemLine("东风不与周郎便，铜雀春深锁二乔", "赤壁", "杜牧", "唐"),
    PoemLine("无可奈何花落去，似曾相识燕归来", "浣溪沙", "晏殊", "宋"),
    PoemLine("黑云压城城欲摧，甲光向日金鳞开", "雁门太守行", "李贺", "唐"),
    PoemLine("了却君王天下事，赢得生前身后名", "破阵子", "辛弃疾", "宋"),
    PoemLine("稻花香里说丰年，听取蛙声一片", "西江月·夜行黄沙道中", "辛弃疾", "宋"),
    PoemLine("醉里挑灯看剑，梦回吹角连营", "破阵子", "辛弃疾", "宋"),
    PoemLine("零落成泥碾作尘，只有香如故", "卜算子·咏梅", "陆游", "宋"),
    PoemLine("无意苦争春，一任群芳妒", "卜算子·咏梅", "陆游", "宋"),
]
COMMON_KEYWORDS = ["春", "花", "月", "山", "水", "风", "云", "天", "人", "心", "家", "雪", "马", "城", "江"]
KEYWORDS = sorted({ch for poem in POEMS for ch in poem.line if "\u4e00" <= ch <= "\u9fff"})
SESSIONS: Dict[str, Dict[str, object]] = {}


def normalize(text: str) -> str:
    return re.sub(r"[\s，。！？；：、,.!?;:]", "", text.strip())


def find_best_match(answer: str, keyword: str, used: List[str]) -> Optional[PoemLine]:
    normalized = normalize(answer)
    if not normalized or keyword not in normalized:
        return None
    for poem in POEMS:
        if poem.line not in used and keyword in poem.line and normalize(poem.line) == normalized:
            return poem
    best, score = None, 0.0
    for poem in POEMS:
        if poem.line in used or keyword not in poem.line:
            continue
        ratio = SequenceMatcher(None, normalized, normalize(poem.line)).ratio()
        if ratio > score:
            best, score = poem, ratio
    return best if best and score >= 0.82 else None


def new_state(keyword: Optional[str] = None) -> Dict[str, object]:
    kw = keyword if keyword in KEYWORDS else random.choice(COMMON_KEYWORDS)
    return {"keyword": kw, "score": 0, "used": []}


def payload(state: Dict[str, object], message: str = "") -> Dict[str, object]:
    keyword = str(state["keyword"])
    used = list(state.get("used", []))
    candidates = [p for p in POEMS if keyword in p.line and p.line not in used]
    hint = random.choice(candidates or POEMS)
    return {
        "keyword": keyword,
        "score": int(state.get("score", 0)),
        "used_count": len(used),
        "message": message,
        "hint": {
            "masked": hint.line.replace(keyword, "□", 1),
            "title": hint.title,
            "author": hint.author,
            "dynasty": hint.dynasty,
        },
    }


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt: str, *args: object) -> None:
        print("%s - %s" % (self.address_string(), fmt % args))

    def session_id(self) -> str:
        jar = cookies.SimpleCookie(self.headers.get("Cookie"))
        sid = jar.get("sid")
        if sid and sid.value in SESSIONS:
            return sid.value
        sid_value = secrets.token_urlsafe(16)
        SESSIONS[sid_value] = new_state()
        self.new_sid = sid_value
        return sid_value

    def state(self) -> Dict[str, object]:
        sid = self.session_id()
        return SESSIONS.setdefault(sid, new_state())

    def send_common_headers(self, status: int, content_type: str) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Cache-Control", "no-store")
        if hasattr(self, "new_sid"):
            self.send_header("Set-Cookie", f"sid={self.new_sid}; Path=/; SameSite=Lax")

    def send_json(self, data: object, status: int = 200) -> None:
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_common_headers(status, "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_file(self, file: Path, content_type: str) -> None:
        body = file.read_bytes()
        self.send_common_headers(200, content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def read_json(self) -> Dict[str, object]:
        length = int(self.headers.get("Content-Length", "0") or 0)
        if length <= 0:
            return {}
        try:
            return json.loads(self.rfile.read(length).decode("utf-8"))
        except Exception:
            return {}

    def do_HEAD(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path
        if path == "/":
            self.send_common_headers(200, "text/html; charset=utf-8")
            self.end_headers()
            return
        if path == "/static/style.css":
            self.send_common_headers(200, "text/css; charset=utf-8")
            self.end_headers()
            return
        if path == "/static/app.js":
            self.send_common_headers(200, "application/javascript; charset=utf-8")
            self.end_headers()
            return
        if path.startswith("/api/"):
            self.send_common_headers(200, "application/json; charset=utf-8")
            self.end_headers()
            return
        self.send_error(404)

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path
        if path == "/":
            html = (ROOT / "templates" / "index.html").read_text("utf-8")
            chips = "".join(f'<button class="chip" data-keyword="{kw}">{kw}</button>' for kw in COMMON_KEYWORDS)
            html = html.replace("{{KEYWORD_CHIPS}}", chips)
            body = html.encode("utf-8")
            self.send_common_headers(200, "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if path == "/api/state":
            self.send_json(payload(self.state()))
            return
        if path == "/api/library":
            query = parse_qs(parsed.query)
            keyword = (query.get("keyword", [""])[0] or "")[:1]
            poems = [p for p in POEMS if not keyword or keyword in p.line]
            self.send_json([asdict(p) for p in poems])
            return
        static_file = None
        if path == "/static/style.css":
            static_file = ROOT / "static" / "style.css"
            return self.send_file(static_file, "text/css; charset=utf-8")
        if path == "/static/app.js":
            static_file = ROOT / "static" / "app.js"
            return self.send_file(static_file, "application/javascript; charset=utf-8")
        self.send_error(404)

    def do_POST(self) -> None:
        data = self.read_json()
        state = self.state()
        if self.path == "/api/new":
            keyword = str(data.get("keyword", ""))[:1]
            state.clear()
            state.update(new_state(keyword if keyword in KEYWORDS else None))
            self.send_json(payload(state, "新一轮开始，请说出含有这个字的诗句。"))
            return
        if self.path == "/api/answer":
            answer = str(data.get("answer", ""))
            keyword = str(state["keyword"])
            used = list(state.get("used", []))
            match = find_best_match(answer, keyword, used)
            if not match:
                result = payload(state, "还没匹配到题库中的诗句。请确认包含令字，并尽量写完整名句。")
                result["ok"] = False
                self.send_json(result)
                return
            used.append(match.line)
            state["used"] = used
            state["score"] = int(state.get("score", 0)) + 10
            result = payload(state, "答对了！+10 分")
            result.update({"ok": True, "matched": asdict(match)})
            self.send_json(result)
            return
        self.send_error(404)


def main() -> None:
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"飞花令练习室已启动：http://127.0.0.1:{PORT}")
    server.serve_forever()


if __name__ == "__main__":
    main()
