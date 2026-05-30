(function(){
  var events=[
    {y:-221,t:'秦统一六国',k:'ancient',tag:'统一',d:'秦始皇建立中国历史上第一个统一的中央集权国家，推行书同文、车同轨。'},
    {y:-202,t:'西汉建立',k:'ancient',tag:'汉朝',d:'刘邦建立西汉，汉代成为中华文明的重要发展阶段。'},
    {y:105,t:'蔡伦改进造纸术',k:'culture',tag:'科技',d:'造纸术降低书写成本，推动文化传播，是中国古代四大发明之一。'},
    {y:581,t:'隋朝建立',k:'ancient',tag:'统一',d:'结束长期分裂，为唐代繁荣奠定制度与交通基础。'},
    {y:618,t:'唐朝建立',k:'ancient',tag:'盛世',d:'唐代政治、经济、文化繁荣，对外交流活跃。'},
    {y:960,t:'北宋建立',k:'ancient',tag:'宋朝',d:'宋代商业发达，活字印刷、指南针等科技继续发展。'},
    {y:1271,t:'元朝建立',k:'ancient',tag:'统一',d:'元朝疆域辽阔，促进多民族交流与中外交通。'},
    {y:1368,t:'明朝建立',k:'ancient',tag:'明朝',d:'明代加强中央集权，郑和下西洋展现海上交流。'},
    {y:1840,t:'鸦片战争',k:'modern',tag:'近代开端',d:'中国近代史开端，提醒我们理解落后挨打与民族复兴。'},
    {y:1911,t:'辛亥革命',k:'modern',tag:'革命',d:'推翻清朝统治，结束两千多年君主专制制度。'},
    {y:1919,t:'五四运动',k:'modern',tag:'觉醒',d:'青年学生推动爱国运动，促进新思想传播。'},
    {y:1949,t:'中华人民共和国成立',k:'modern',tag:'新中国',d:'中国历史进入新的发展阶段。'}
  ];
  var current=[];
  function $(id){return document.getElementById(id)}
  function yearText(y){return y<0?'公元前'+(-y)+'年':y+'年'}
  function renderTimeline(filter){var box=$('timeline'), html='', list=[]; for(var i=0;i<events.length;i++){if(filter==='all'||events[i].k===filter){list.push(events[i])}} for(i=0;i<list.length;i++){var e=list[i]; html+='<article class="event"><div><span class="year">'+yearText(e.y)+'</span><span class="tag">'+e.tag+'</span></div><b>'+e.t+'</b><p>'+e.d+'</p></article>'} box.innerHTML=html}
  function card(){var e=events[Math.floor(Math.random()*events.length)]; $('flashCard').innerHTML='<div class="big">'+e.t+'</div><p><b>'+yearText(e.y)+'</b> · '+e.tag+'</p><p>'+e.d+'</p>'}
  function shuffle(a){var b=a.slice(); for(var i=b.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=b[i];b[i]=b[j];b[j]=t} return b}
  function newQuiz(){current=shuffle(events).slice(0,5); current=shuffle(current); renderQuiz(); $('result').innerHTML='请按从早到晚排序。'}
  function renderQuiz(){var box=$('quizList'); box.innerHTML=''; for(var i=0;i<current.length;i++){var e=current[i], row=document.createElement('div'); row.className='quiz-item'; row.innerHTML='<div class="num">'+(i+1)+'</div><div><div class="title">'+e.t+'</div><div class="date">'+yearText(e.y)+'</div></div><div class="moves"><button class="move" data-i="'+i+'" data-d="-1">↑</button><button class="move" data-i="'+i+'" data-d="1">↓</button></div>'; box.appendChild(row)} var btns=box.getElementsByTagName('button'); for(i=0;i<btns.length;i++){btns[i].onclick=function(){var idx=parseInt(this.getAttribute('data-i'),10), d=parseInt(this.getAttribute('data-d'),10), ni=idx+d; if(ni<0||ni>=current.length)return; var t=current[idx]; current[idx]=current[ni]; current[ni]=t; renderQuiz()}}}
  function check(){var ok=true; for(var i=1;i<current.length;i++){if(current[i-1].y>current[i].y) ok=false} $('result').innerHTML=ok?'太棒了，顺序正确！可以再换一组挑战。':'还有几项顺序需要调整：越早发生的事件越靠上。'}
  function reveal(){current.sort(function(a,b){return a.y-b.y}); renderQuiz(); $('result').innerHTML='已按正确时间顺序排列，先读一遍年份，再记关键词。'}
  document.addEventListener('DOMContentLoaded',function(){renderTimeline('all');card();newQuiz();var tabs=document.querySelectorAll('.tab'); for(var i=0;i<tabs.length;i++){tabs[i].onclick=function(){for(var j=0;j<tabs.length;j++)tabs[j].className='tab';this.className='tab active';renderTimeline(this.getAttribute('data-filter'))}} $('newCard').onclick=card; $('shuffleBtn').onclick=newQuiz; $('checkBtn').onclick=check; $('revealBtn').onclick=reveal;});
})();
