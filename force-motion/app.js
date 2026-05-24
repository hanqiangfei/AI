(function(){
  var $=function(id){return document.getElementById(id)};
  var force=$('force'),mass=$('mass'),friction=$('friction'),cart=$('cart'),chart=$('chart'),ctx=chart.getContext('2d');
  var running=false,t=0,v=0,x=0,last=0,points=[];
  function sgn(n){return n>0?1:n<0?-1:0}
  function physics(){
    var F=+force.value,m=+mass.value,fr=+friction.value;
    var resist=v!==0?-sgn(v)*fr:(Math.abs(F)<=fr?-F:-sgn(F)*fr);
    var net=F+resist, a=net/m;
    if(v===0 && Math.abs(F)<=fr){net=0;a=0}
    return {F:F,m:m,fr:fr,net:net,a:a};
  }
  function draw(){
    var p=physics();
    $('forceVal').innerHTML=p.F;$('massVal').innerHTML=p.m;$('frictionVal').innerHTML=p.fr;
    $('net').innerHTML=p.net.toFixed(1)+' N';$('acc').innerHTML=p.a.toFixed(2)+' m/s²';$('vel').innerHTML=v.toFixed(1)+' m/s';$('dist').innerHTML=Math.abs(x).toFixed(1)+' m';
    var pos=18+(Math.max(0,Math.min(1,(x%100+100)%100/100))*($('cart').parentNode.clientWidth-112));cart.style.left=pos+'px';
    $('arrow').style.transform='scaleX('+(p.F<0?-1:1)+')';$('arrow').style.background=p.net===0?'#d8e9ff':(p.net>0?'#80f0ff':'#ff9ab8');
    ctx.clearRect(0,0,chart.width,chart.height);ctx.strokeStyle='rgba(255,255,255,.25)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(38,15);ctx.lineTo(38,178);ctx.lineTo(600,178);ctx.stroke();
    ctx.fillStyle='rgba(248,251,255,.75)';ctx.font='16px sans-serif';ctx.fillText('速度 v',10,18);ctx.fillText('时间 t',548,202);
    ctx.strokeStyle='#83e7ff';ctx.lineWidth=4;ctx.beginPath();
    for(var i=0;i<points.length;i++){var px=38+i*(560/119),py=178-Math.max(-20,Math.min(20,points[i]))*7;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py)}ctx.stroke();
  }
  function step(ts){if(!last)last=ts;var dt=Math.min(.05,(ts-last)/1000);last=ts;if(running){var p=physics();v+=p.a*dt;if(Math.abs(v)<.03&&Math.abs(p.net)<.01)v=0;x+=v*dt;t+=dt;if(points.length>120)points.shift();points.push(v);draw()}requestAnimationFrame(step)}
  $('start').onclick=function(){running=true};$('pause').onclick=function(){running=false};$('reset').onclick=function(){running=false;t=0;v=0;x=0;points=[];draw()};$('kick').onclick=function(){v+=2;running=true};
  force.oninput=mass.oninput=friction.oninput=draw;
  var qs=document.querySelectorAll('[data-answer]');for(var i=0;i<qs.length;i++){qs[i].onclick=function(){ $('quizResult').innerHTML=this.getAttribute('data-answer')==='right'?'答对啦：a = F合 / m，质量越大加速度越小。':'再想想：牛顿第二定律告诉我们 a = F合 / m。';};}
  points.push(0);draw();requestAnimationFrame(step);
})();
