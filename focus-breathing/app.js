(function(){
  var modes={calm:[['吸气',4,'inhale'],['停留',2,'hold'],['呼气',6,'exhale']],box:[['吸气',4,'inhale'],['停留',4,'hold'],['呼气',4,'exhale'],['停留',4,'hold']],sleep:[['吸气',4,'inhale'],['慢慢呼气',8,'exhale']]};
  var tips={inhale:'像闻一朵花一样，轻轻吸气。',hold:'不用用力，安静停留一下。',exhale:'像吹凉热汤一样，慢慢呼气。'};
  var running=false,paused=false,phase=0,sec=0,round=0,total=6,tickId=null,focusId=null,focusLeft=300,focusMin=5,focusRun=false;
  function $(id){return document.getElementById(id)}
  function pad(n){return n<10?'0'+n:''+n}
  function fmt(s){return pad(Math.floor(s/60))+':'+pad(s%60)}
  function todayKey(){var d=new Date();return 'focus-breathing-'+d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
  function load(){try{return JSON.parse(localStorage.getItem(todayKey())||'{"breath":0,"focus":0}')}catch(e){return {breath:0,focus:0}}}
  function save(o){localStorage.setItem(todayKey(),JSON.stringify(o));renderStats()}
  function renderStats(){var s=load();$('doneBreath').innerHTML=s.breath;$('doneFocus').innerHTML=s.focus;$('encourage').innerHTML=s.breath+s.focus>0?'今天已经完成了一点点，很稳。下一步只要继续一个小动作。':'小小一轮呼吸，也是在照顾自己的大脑。'}
  function currentSeq(){return modes[$('modeSelect').value]||modes.calm}
  function updateBreath(){var seq=currentSeq(),p=seq[phase]||seq[0];$('phaseText').innerHTML=p[0];$('guideText').innerHTML=tips[p[2]]||'保持自然、舒服的节奏。';$('orb').className='orb '+p[2];$('roundNow').innerHTML=round;$('roundTotal').innerHTML=total;var left=0;for(var i=phase;i<seq.length;i++)left+=seq[i][1];left+=(total-round-1)*seq.reduce(function(a,b){return a+b[1]},0);left+=sec;$('timeLeft').innerHTML=fmt(Math.max(0,left))}
  function stopTick(){if(tickId){clearInterval(tickId);tickId=null}}
  function startBreath(){stopTick();total=parseInt($('roundInput').value,10)||6;running=true;paused=false;round=0;phase=0;sec=currentSeq()[0][1];$('startBtn').innerHTML='重新开始';tickId=setInterval(function(){if(paused)return;sec--;if(sec<=0){phase++;var seq=currentSeq();if(phase>=seq.length){phase=0;round++;if(round>=total){completeBreath();return}}sec=seq[phase][1]}updateBreath()},1000);updateBreath()}
  function completeBreath(){stopTick();running=false;$('phaseText').innerHTML='完成';$('guideText').innerHTML='做得好。现在可以带着安静的大脑开始学习。';$('orb').className='orb';$('roundNow').innerHTML=total;$('timeLeft').innerHTML='00:00';var s=load();s.breath+=1;save(s)}
  function resetBreath(){stopTick();running=false;paused=false;phase=0;sec=0;round=0;$('startBtn').innerHTML='开始训练';$('pauseBtn').innerHTML='暂停';$('orb').className='orb';$('phaseText').innerHTML='准备';$('guideText').innerHTML='选择一个节奏，按开始，先把肩膀放松。';$('roundNow').innerHTML='0';$('roundTotal').innerHTML=$('roundInput').value;$('timeLeft').innerHTML='00:00'}
  function focusRender(){$('focusTime').innerHTML=fmt(focusLeft)}
  function focusStart(){if(focusRun)return;focusRun=true;$('focusStart').innerHTML='专注中';focusId=setInterval(function(){focusLeft--;focusRender();if(focusLeft<=0){clearInterval(focusId);focusRun=false;$('focusStart').innerHTML='开始专注';var s=load();s.focus+=focusMin;save(s);alert('专注完成，休息一下眼睛吧！');focusReset()}},1000)}
  function focusReset(){if(focusId)clearInterval(focusId);focusRun=false;focusLeft=focusMin*60;$('focusStart').innerHTML='开始专注';focusRender()}
  document.addEventListener('DOMContentLoaded',function(){
    $('roundInput').oninput=function(){$('roundLabel').innerHTML=this.value+' 轮';$('roundTotal').innerHTML=this.value};
    $('modeSelect').onchange=function(){if(!running)resetBreath()};
    $('startBtn').onclick=startBreath;$('pauseBtn').onclick=function(){if(!running)return;paused=!paused;$('pauseBtn').innerHTML=paused?'继续':'暂停'};$('resetBtn').onclick=resetBreath;
    var cs=$('focusChoices').getElementsByTagName('button');for(var i=0;i<cs.length;i++){cs[i].onclick=function(){for(var j=0;j<cs.length;j++)cs[j].className='';this.className='active';focusMin=parseInt(this.getAttribute('data-min'),10);focusReset()}};
    $('focusStart').onclick=focusStart;$('focusReset').onclick=focusReset;$('clearStats').onclick=function(){localStorage.removeItem(todayKey());renderStats()};
    resetBreath();focusRender();renderStats();
  });
})();
