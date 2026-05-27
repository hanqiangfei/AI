(function(){
  var KEY='emotion-diary-v1';
  var selected={score:5,face:'😄',label:'开心'};
  var tips={
    5:['把今天让你开心的 1 件事写下来，快乐会更容易被记住。','把好心情分享给家人或朋友，也可以悄悄夸夸自己。'],
    4:['保持这份平静：喝水、伸展肩颈，然后继续下一件小事。','给自己 3 分钟整理书桌，清爽环境会帮大脑安静下来。'],
    3:['试试 5-4-3-2-1 观察法：看见5样东西，摸到4种触感，听见3种声音。','把任务切成一个小步骤，先完成最容易的一步。'],
    2:['慢慢吸气 4 秒、呼气 6 秒，重复 5 次；担心会被身体一点点放下。','把担心写成“我可以做什么”，只选一个能马上行动的小办法。'],
    1:['难过时可以先抱抱自己：这不是软弱，是在照顾内心。','找信任的大人说一句“我今天有点难受”，被听见会轻松很多。']
  };
  function $(id){return document.getElementById(id)}
  function load(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return []}}
  function saveAll(list){localStorage.setItem(KEY,JSON.stringify(list.slice(0,30)))}
  function today(){var d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
  function pad(n){return n<10?'0'+n:''+n}
  function label(score){return ['','难过','担心','一般','平静','开心'][score]||'心情'}
  function setTip(){var arr=tips[selected.score]||tips[3];$('tipCard').innerHTML=arr[Math.floor(Math.random()*arr.length)]}
  function draw(){
    var c=$('chart'),ctx=c.getContext('2d'),w=c.width,h=c.height,entries=load().slice(0,7).reverse();
    ctx.clearRect(0,0,w,h); ctx.fillStyle='#fff'; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='#e9d5ff'; ctx.lineWidth=1;
    for(var i=1;i<=5;i++){var y=26+(5-i)*(h-58)/4;ctx.beginPath();ctx.moveTo(44,y);ctx.lineTo(w-18,y);ctx.stroke();ctx.fillStyle='#94a3b8';ctx.font='14px sans-serif';ctx.fillText(i,18,y+5)}
    if(!entries.length){ctx.fillStyle='#64748b';ctx.font='20px sans-serif';ctx.fillText('保存一条记录后，这里会出现情绪曲线',120,135);return}
    var pts=[]; for(i=0;i<entries.length;i++){var x=58+i*((w-92)/Math.max(1,entries.length-1)); var y=26+(5-entries[i].score)*(h-58)/4; pts.push({x:x,y:y,e:entries[i]})}
    ctx.strokeStyle='#8b5cf6';ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath(); for(i=0;i<pts.length;i++){if(i===0)ctx.moveTo(pts[i].x,pts[i].y);else ctx.lineTo(pts[i].x,pts[i].y)} ctx.stroke();
    for(i=0;i<pts.length;i++){ctx.fillStyle='#ec4899';ctx.beginPath();ctx.arc(pts[i].x,pts[i].y,9,0,Math.PI*2);ctx.fill();ctx.fillStyle='#475569';ctx.font='13px sans-serif';ctx.fillText(pts[i].e.date.slice(5),pts[i].x-18,h-16)}
  }
  function render(){
    var list=load(), box=$('entries'); box.innerHTML='';
    if(!list.length){box.innerHTML='<p class="hint">暂无记录。每天一条就很好，不需要写很多。</p>'} else {
      for(var i=0;i<Math.min(8,list.length);i++){var e=list[i],div=document.createElement('div');div.className='entry';div.innerHTML='<div class="face">'+e.face+'</div><div><b>'+e.date+' · '+label(e.score)+'</b><p>事件：'+esc(e.event||'未填写')+'</p><p>安慰语：'+esc(e.comfort||'愿你慢慢来，也能做得很好。')+'</p></div>';box.appendChild(div)}
    }
    var avg=0; for(i=0;i<Math.min(7,list.length);i++)avg+=list[i].score; if(list.length){avg=avg/Math.min(7,list.length);$('summary').innerHTML='最近 '+Math.min(7,list.length)+' 次平均心情：'+avg.toFixed(1)+' / 5。'+(avg>=4?'状态不错，记得继续照顾睡眠和运动。':avg>=3?'有起伏很正常，先稳住一个小行动。':'这几天可能有点辛苦，建议和家人/老师聊一聊。')}
    draw(); setTip();
  }
  function esc(s){return String(s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]})}
  document.addEventListener('DOMContentLoaded',function(){
    var buttons=document.querySelectorAll('.mood'); for(var i=0;i<buttons.length;i++){buttons[i].onclick=function(){for(var j=0;j<buttons.length;j++)buttons[j].className='mood';this.className='mood active';selected={score:parseInt(this.getAttribute('data-score'),10),face:this.getAttribute('data-face'),label:this.innerText};setTip()}}
    $('saveBtn').onclick=function(){var list=load(), d=today(), item={date:d,score:selected.score,face:selected.face,event:$('eventText').value,comfort:$('comfortText').value}; var out=[item]; for(var i=0;i<list.length;i++){if(list[i].date!==d)out.push(list[i])} saveAll(out); $('eventText').value=''; $('comfortText').value=''; render()};
    $('clearBtn').onclick=function(){if(confirm('确定清空当前浏览器里的情绪记录吗？')){localStorage.removeItem(KEY);render()}};
    $('newTipBtn').onclick=setTip; render();
  });
})();
