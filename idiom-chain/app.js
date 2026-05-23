(function () {
  var idioms = [
    "一马当先","先声夺人","人山人海","海阔天空","空前绝后","后来居上","上下一心","心花怒放","放虎归山","山清水秀",
    "秀外慧中","中流砥柱","柱石之臣","臣心如水","水到渠成","成竹在胸","胸有成竹","竹报平安","安居乐业","业精于勤",
    "勤能补拙","拙嘴笨舌","舌战群儒","儒雅风流","流连忘返","返老还童","童叟无欺","欺世盗名","名列前茅","茅塞顿开",
    "开卷有益","益国利民","民富国强","强词夺理","理直气壮","壮志凌云","云开见日","日新月异","异想天开","开门见山",
    "山高水长","长年累月","月明星稀","稀世之宝","宝刀不老","老当益壮","壮心不已","已成定局","局促不安","安然无恙",
    "技高一筹","筹谋划策","策马扬鞭","鞭长莫及","及时行乐","乐极生悲","悲欢离合","合情合理","理所当然",
    "然糠自照","照猫画虎","虎头蛇尾","尾大不掉","掉以轻心","心平气和","和风细雨","雨过天晴","晴天霹雳",
    "耳聪目明","明辨是非","非同小可","可歌可泣","泣不成声","声东击西","西窗剪烛","计日程功","功成名就",
    "就事论事","事半功倍","倍道而进","进退两难","难能可贵","贵人多忘","忘年之交","交口称赞","赞不绝口","口若悬河",
    "河清海晏","晏然自若","若有所思","思如泉涌","涌泉相报","报仇雪恨","恨之入骨","骨肉相连","连绵不断","断章取义",
    "义无反顾","顾全大局","局外之人","人定胜天","天长地久","久别重逢","逢凶化吉","吉祥如意","意气风发","发愤图强",
    "强身健体","体贴入微","微不足道","道听途说","说一不二","二话不说","说古道今","今非昔比","比翼双飞","飞黄腾达",
    "达官贵人","人尽其才","才高八斗","斗志昂扬","扬眉吐气","气象万千","千方百计","计上心来","来日方长","长驱直入",
    "入木三分","分秒必争","争先恐后","后生可畏","畏首畏尾","尾生抱柱","柱天踏地","地久天长","长治久安","安步当车",
    "车水马龙","龙马精神","神采飞扬","扬长避短","短兵相接","接二连三","三思而行","行云流水","水落石出","出类拔萃",
    "华而不实","实事求是","是非分明","明知故问","问心无愧","愧不敢当","当机立断","断壁残垣",
    "庭无留事","事在人为","为人师表","表里如一","一帆风顺","顺水推舟","舟车劳顿","顿开茅塞","塞翁失马","马到成功"
  ];

  var byFirst = {};
  var used = {};
  var current = "一马当先";
  var score = 0;
  var streak = 0;
  var timeLeft = 60;
  var timerId = null;
  var started = false;

  idioms.forEach(function (item) {
    var first = item.charAt(0);
    if (!byFirst[first]) byFirst[first] = [];
    byFirst[first].push(item);
  });

  var $ = function (id) { return document.getElementById(id); };
  var scoreEl = $("score"), streakEl = $("streak"), timerEl = $("timer");
  var currentEl = $("currentIdiom"), targetEl = $("targetChar"), inputEl = $("answerInput");
  var messageEl = $("message"), suggestionsEl = $("suggestions"), historyEl = $("history");

  function lastChar(text) { return text.charAt(text.length - 1); }
  function clean(text) { return String(text || "").replace(/\s/g, "").replace(/[，。！？,.!?]/g, ""); }
  function target() { return lastChar(current); }
  function options() { return (byFirst[target()] || []).filter(function (x) { return !used[x] && x !== current; }); }
  function pickStart() {
    var starts = idioms.filter(function (x) { return (byFirst[lastChar(x)] || []).length >= 2; });
    return starts[Math.floor(Math.random() * starts.length)] || "一马当先";
  }
  function render() {
    scoreEl.textContent = score;
    streakEl.textContent = streak;
    timerEl.textContent = timeLeft;
    currentEl.textContent = current;
    targetEl.textContent = target();
    suggestionsEl.innerHTML = "";
  }
  function addHistory(text, ok) {
    var li = document.createElement("li");
    li.textContent = (ok ? "✓ " : "• ") + text;
    historyEl.insertBefore(li, historyEl.firstChild);
  }
  function setMessage(text) { messageEl.textContent = text; }
  function startTimer() {
    if (started) return;
    started = true;
    timerId = setInterval(function () {
      timeLeft -= 1;
      if (timeLeft <= 0) {
        timeLeft = 0;
        clearInterval(timerId);
        inputEl.disabled = true;
        setMessage("时间到！本轮得分 " + score + "。点“重新开始”再来一局吧。");
      }
      render();
    }, 1000);
  }
  function submitAnswer(value) {
    var answer = clean(value);
    if (!answer) return setMessage("先输入一个成语哦。");
    startTimer();
    if (timeLeft <= 0) return;
    if (answer.charAt(0) !== target()) {
      streak = 0;
      render();
      return setMessage("还差一点：应该以“" + target() + "”开头。");
    }
    if (used[answer] || answer === current) {
      streak = 0;
      render();
      return setMessage("这个成语已经用过了，换一个试试。");
    }
    if (idioms.indexOf(answer) === -1) {
      streak = 0;
      render();
      return setMessage("内置成语库暂时没有收录“" + answer + "”。可以点提示看看可选答案。");
    }
    used[answer] = true;
    current = answer;
    streak += 1;
    score += 10 + Math.min(streak - 1, 5) * 2;
    addHistory(answer, true);
    inputEl.value = "";
    var next = options();
    if (!next.length) {
      score += 20;
      setMessage("漂亮！你接到了一个“死胡同”，额外 +20 分。我给你换一个新起点。");
      current = pickStart();
      used[current] = true;
      addHistory("新起点：" + current, false);
    } else {
      setMessage("接得好！现在请接一个以“" + target() + "”开头的成语。");
    }
    render();
  }
  function showHints() {
    startTimer();
    suggestionsEl.innerHTML = "";
    var list = options().slice(0, 3);
    if (!list.length) return setMessage("这一轮没有可接答案了，点“换一个”继续。");
    list.forEach(function (item) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = item;
      btn.onclick = function () { inputEl.value = item; inputEl.focus(); };
      suggestionsEl.appendChild(btn);
    });
    score = Math.max(0, score - 2);
    setMessage("提示会扣 2 分。可以点一个候选词填入输入框。");
    render();
  }
  function skip() {
    startTimer();
    streak = 0;
    current = pickStart();
    used[current] = true;
    addHistory("换题：" + current, false);
    setMessage("已换题。现在请接一个以“" + target() + "”开头的成语。");
    render();
  }
  function restart() {
    if (timerId) clearInterval(timerId);
    used = {};
    current = "一马当先";
    used[current] = true;
    score = 0;
    streak = 0;
    timeLeft = 60;
    started = false;
    inputEl.disabled = false;
    inputEl.value = "";
    historyEl.innerHTML = "";
    addHistory("起点：" + current, false);
    setMessage("新一局开始！输入一个以“" + target() + "”开头的成语。");
    render();
    inputEl.focus();
  }

  document.getElementById("answerForm").addEventListener("submit", function (ev) {
    ev.preventDefault();
    submitAnswer(inputEl.value);
  });
  document.getElementById("hintBtn").onclick = showHints;
  document.getElementById("skipBtn").onclick = skip;
  document.getElementById("restartBtn").onclick = restart;

  restart();
}());
