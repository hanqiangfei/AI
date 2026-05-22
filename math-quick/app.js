(function(){
  var state={score:0,streak:0,time:90,timer:null,current:null,mistakes:[]};
  var $=function(id){return document.getElementById(id)};
  function randint(min,max){return Math.floor(Math.random()*(max-min+1))+min}
  function round2(n){return Math.round(n*100)/100}
  function makeQuestion(){
    var mode=$('mode').value, level=$('level').value, max=level==='easy'?20:(level==='hard'?120:60), a=randint(1,max), b=randint(1,max), op, ans, text;
    if(mode==='add'){op=Math.random()<.5?'+':'-'; if(op==='-'&&b>a){var t=a;a=b;b=t} ans=op==='+'?a+b:a-b; text=a+' '+op+' '+b+' = ?'}
    else if(mode==='mul'){op=Math.random()<.55?'×':'÷'; if(op==='×'){b=randint(2,level==='hard'?15:9);ans=a*b;text=a+' × '+b+' = ?'}else{b=randint(2,12);ans=a;text=(a*b)+' ÷ '+b+' = ?'}}
    else if(mode==='decimal'){a=round2(randint(10,max*10)/10);b=round2(randint(1,90)/10);op=Math.random()<.5?'+':'-';if(op==='-'&&b>a){var u=a;a=b;b=u}ans=round2(op==='+'?a+b:a-b);text=a+' '+op+' '+b+' = ?'}
    else if(mode==='fraction'){var n1=randint(1,9),d1=randint(n1+1,12),n2=randint(1,9),d2=randint(n2+1,12);ans=(n1/d1>n2/d2)?1:(n1/d1<n2/d2?-1:0);text=n1+'/'+d1+' 与 '+n2+'/'+d2+' 谁大？填 1(左) -1(右) 0(相等)'}
    else{var r=Math.random(); if(r<.3){return (function(){var old=$('mode').value;$('mode').value='add';var q=makeQuestion();$('mode').value=old;return q})()} if(r<.65){return (function(){var old=$('mode').value;$('mode').value='mul';var q=makeQuestion();$('mode').value=old;return q})()} return (function(){var old=$('mode').value;$('mode').value='decimal';var q=makeQuestion();$('mode').value=old;return q})()}
    return {text:text,answer:ans};
  }
  function render(){ $('score').innerHTML=state.score; $('streak').innerHTML=state.streak; $('time').innerHTML=state.time; }
  function next(){state.current=makeQuestion();$('question').innerHTML=state.current.text;$('answer').value='';$('answer').focus();}
  function start(){clearInterval(state.timer);state.score=0;state.streak=0;state.time=90;render();next();$('feedback').className='feedback';$('feedback').innerHTML='练习开始，加油！';state.timer=setInterval(function(){state.time--;render();if(state.time<=0){clearInterval(state.timer);$('feedback').className='feedback ok';$('feedback').innerHTML='时间到！本轮得分 '+state.score+'，最高连对 '+state.streak+'。';}},1000)}
  function submit(e){e.preventDefault(); if(!state.current||state.time<=0){return} var raw=$('answer').value.replace(/\s/g,''); var val=parseFloat(raw); if(raw===''){return} var ok=Math.abs(val-state.current.answer)<0.01; if(ok){state.score+=10+Math.min(state.streak,5);state.streak++;$('feedback').className='feedback ok';$('feedback').innerHTML='答对啦！连对 '+state.streak+' 题。';next()} else {state.streak=0;state.mistakes.unshift(state.current.text+' 正确答案：'+state.current.answer+'，你的答案：'+raw);state.mistakes=state.mistakes.slice(0,8);saveMistakes();renderMistakes();$('feedback').className='feedback bad';$('feedback').innerHTML='再想想，正确答案是 '+state.current.answer;next()} render();}
  function saveMistakes(){try{localStorage.setItem('mathQuickMistakes',JSON.stringify(state.mistakes))}catch(e){}}
  function loadMistakes(){try{state.mistakes=JSON.parse(localStorage.getItem('mathQuickMistakes')||'[]')}catch(e){state.mistakes=[]}}
  function renderMistakes(){var ul=$('mistakes');ul.innerHTML=''; if(!state.mistakes.length){ul.innerHTML='<li>暂无错题，保持专注！</li>';return} for(var i=0;i<state.mistakes.length;i++){var li=document.createElement('li');li.appendChild(document.createTextNode(state.mistakes[i]));ul.appendChild(li)}}
  $('startBtn').onclick=start; $('answerForm').onsubmit=submit; $('clearBtn').onclick=function(){state.mistakes=[];saveMistakes();renderMistakes()}; loadMistakes(); renderMistakes(); render();
})();
