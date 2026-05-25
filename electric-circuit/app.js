(function(){
  var $=function(id){return document.getElementById(id)};
  var state={q:null};
  function val(id){return parseFloat($(id).value)}
  function fmt(n,d){return (Math.round(n*Math.pow(10,d))/Math.pow(10,d)).toFixed(d)}
  function calc(){
    var mode=$('mode').value,u=val('u'),r1=val('r1'),r2=val('r2'),closed=$('closed').checked;
    var req,i,info1,info2,i1=0,i2=0,u1=0,u2=0;
    if(mode==='series'){req=r1+r2;if(closed){i=u/req;i1=i2=i;u1=i*r1;u2=i*r2}}
    else if(mode==='parallel'){req=1/(1/r1+1/r2);if(closed){i=u/req;i1=u/r1;i2=u/r2;u1=u2=u}}
    else{var branch=r1+4;req=1/(1/branch+1/r2);if(closed){i=u/req;i1=u/branch;i2=u/r2;u1=i1*r1;u2=u}}
    if(!closed){i=0;req=mode==='series'?r1+r2:(mode==='parallel'?1/(1/r1+1/r2):1/(1/(r1+4)+1/r2));}
    $('uVal').innerHTML=u;$('r1Val').innerHTML=r1;$('r2Val').innerHTML=r2;$('voltLabel').textContent=u+'V';
    $('req').innerHTML=fmt(req,2)+' Ω';$('itotal').innerHTML=fmt(i||0,2)+' A';
    $('r1info').innerHTML=fmt(i1,2)+'A / '+fmt(u1,1)+'V';$('r2info').innerHTML=fmt(i2,2)+'A / '+fmt(u2,1)+'V';
    $('status').innerHTML=closed?'电路已闭合':'开关断开：电流为 0';
    $('switchMark').setAttribute('class',closed?'switch':'switch open');
    drawMode(mode,closed,i1,i2);
    return {mode:mode,u:u,r1:r1,r2:r2,req:req,i:i||0,i1:i1,i2:i2,u1:u1,u2:u2};
  }
  function drawMode(mode,closed,i1,i2){
    var path={series:'M100 180 H235 M325 180 H370 M430 180 H540 M540 180 V88 H100 V180',parallel:'M100 180 V88 H235 M325 88 H370 M430 88 H540 V180 M100 180 V272 H235 M325 272 H370 M430 272 H540 V180',mixed:'M100 180 V88 H235 M325 88 H370 M430 88 H540 V180 M100 180 V272 H235 M325 272 H540 V180'};
    $('wireMain').setAttribute('d',path[mode]);
    $('resA').setAttribute('transform',mode==='series'?'translate(0,89)':'');
    $('lampA').setAttribute('transform',mode==='series'?'translate(0,89)':'');
    $('resB').style.display=mode==='series'?'none':'block';
    $('lampB').style.display=mode==='mixed'?'none':'block';
    var b1=Math.min(1,(i1||0)/2),b2=Math.min(1,(i2||0)/2);
    $('lampA').setAttribute('class',closed&&b1>.02?'lamp on':'lamp');$('lampB').setAttribute('class',closed&&b2>.02?'lamp on':'lamp');
    $('lampA').style.opacity=.45+b1*.55;$('lampB').style.opacity=.45+b2*.55;
  }
  var t=0;function animate(){var c=calc(),e=$('electron');t+=(c.i||0)*1.5+0.8;var x=100+(t%440);e.setAttribute('cx',x);e.setAttribute('cy',c.mode==='parallel'?(x<320?88:272):180);if(!$('closed').checked)e.setAttribute('opacity','.25');else e.setAttribute('opacity','1');requestAnimationFrame(animate)}
  function newTask(){var c=calc(),kind=Math.floor(Math.random()*3);state.q={kind:kind,c:c};$('answer').value='';if(kind===0){$('question').innerHTML='当前总电阻约是多少 Ω？'}else if(kind===1){$('question').innerHTML='当前总电流约是多少 A？'}else{$('question').innerHTML='R1 两端电压约是多少 V？'}$('feedback').innerHTML='先观察读数，再用 U=I×R 或 I=U÷R 验算。'}
  function check(){if(!state.q)newTask();var a=parseFloat($('answer').value),c=state.q.c,target=state.q.kind===0?c.req:(state.q.kind===1?c.i:c.u1);if(isNaN(a)){$('feedback').innerHTML='先输入一个数字哦。';return}var ok=Math.abs(a-target)<=Math.max(.08,Math.abs(target)*.08);$('feedback').innerHTML=ok?'答对啦！标准值约 '+fmt(target,2)+'。':'再试试：标准值约 '+fmt(target,2)+'，注意串并联规则。'}
  ['mode','u','r1','r2','closed'].forEach(function(id){$(id).addEventListener('input',calc);$(id).addEventListener('change',calc)});$('task').onclick=newTask;$('check').onclick=check;$('hint').onclick=function(){$('feedback').innerHTML='串联：电流处处相等，总电阻相加；并联：各支路电压相等，电流相加。'};$('reset').onclick=function(){$('mode').value='series';$('u').value=6;$('r1').value=6;$('r2').value=6;$('closed').checked=true;calc()};
  calc();animate();
})();
