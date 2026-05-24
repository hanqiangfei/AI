(function(){
  var sets=[
    {name:'苹果 vs 砝码', left:['🍎',5], right:['⚖️',5]},
    {name:'书本 vs 积木', left:['📘',4], right:['🧱',4]},
    {name:'电池 vs 磁铁', left:['🔋',3], right:['🧲',3]},
    {name:'星球 vs 卫星', left:['🪐',6], right:['🛰️',6]}
  ];
  var beamMass=2;
  var state={index:0,pivotY:-30,objectY:42,theta:22,animating:false};
  var el=function(id){return document.getElementById(id)};
  var beam=el('beam'), pivot=el('pivotPoint'), gPoint=el('gravityCenter'), dLine=el('distanceLine'), dLabel=el('dLabel'), angleGuide=el('angleGuide');
  var pivotSlider=el('pivotSlider'), objectSlider=el('objectSlider'), angleSlider=el('angleSlider');
  function mass(item){return item[1]}
  function totalMass(){var s=sets[state.index];return beamMass+mass(s.left)+mass(s.right)}
  function centerY(){var s=sets[state.index];return ((mass(s.left)+mass(s.right))*state.objectY)/totalMass()}
  function dValue(){return Math.round(centerY()-state.pivotY)}
  function torque(){return -totalMass()*dValue()*Math.sin(state.theta*Math.PI/180)/100}
  function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
  function mode(){var d=dValue(); if(d>0)return 'stable'; if(d<0)return 'unstable'; return 'neutral'}
  function renderItem(node,item){node.innerHTML='';var d=document.createElement('span');d.className='item';d.textContent=item[0];var s=document.createElement('small');s.textContent=item[1]+'kg';d.appendChild(s);node.appendChild(d)}
  function modeText(){
    var d=dValue(), m=mode();
    if(m==='stable')return '稳定平衡：d='+d+' > 0，O 高于 G，释放后产生恢复力矩并回正。';
    if(m==='neutral')return '随遇平衡：d=0，O 与 G 等高，τ=0，任意角度都能静止。';
    return '不稳定平衡：d='+d+' < 0，G 高于 O，一碰就产生翻倒力矩。';
  }
  function update(){
    var s=sets[state.index], gy=centerY(), d=dValue();
    el('levelName').textContent=s.name; el('targetText').textContent='左右各 '+mass(s.left)+'kg，质量相同';
    renderItem(el('leftPan'),s.left); renderItem(el('rightPan'),s.right);
    beam.style.transform='rotate('+state.theta+'deg)';
    pivot.style.transform='translate(-50%,-50%) translateY('+state.pivotY+'px)';
    gPoint.style.transform='translate(-50%,-50%) translateY('+gy+'px) rotate('+state.theta+'deg)';
    dLine.style.top=(Math.min(state.pivotY,gy)+210)+'px';
    dLine.style.height=Math.abs(gy-state.pivotY)+'px';
    dLine.className='distance-line '+(d>=0?'positive':'negative');
    dLabel.textContent='d='+d;
    angleGuide.style.transform='rotate('+state.theta+'deg)';
    el('thetaLabel').textContent='θ='+Math.round(state.theta)+'°';
    el('cgText').textContent='Gᵧ='+Math.round(gy)+'px';
    el('dText').textContent=d+'px';
    el('restoreTorque').textContent=torque().toFixed(2);
    el('pivotText').textContent=state.pivotY+'px';
    el('objectText').textContent=state.objectY+'px';
    el('angleText').textContent=Math.round(state.theta)+'°';
    el('resultText').innerHTML='<strong>'+modeText()+'</strong> 计算：Gᵧ=(m梁·0+m左·y物+m右·y物)/M，d=Gᵧ-Oᵧ。';
  }
  function release(){
    if(state.animating)return; state.animating=true;
    var step=0;
    function tick(){
      step++;
      var m=mode();
      if(m==='stable'){
        state.theta*=0.82;
        if(Math.abs(state.theta)<0.35){state.theta=0;state.animating=false;angleSlider.value=0;update();return;}
      }else if(m==='neutral'){
        state.animating=false;update();return;
      }else{
        var dir=state.theta===0?1:(state.theta>0?1:-1);
        state.theta=clamp(state.theta+dir*(2.5+step*0.45),-86,86);
        if(Math.abs(state.theta)>=86){state.animating=false;angleSlider.value=Math.round(state.theta);update();return;}
      }
      angleSlider.value=Math.round(state.theta); update(); setTimeout(tick,65);
    }
    tick();
  }
  pivotSlider.oninput=function(){state.pivotY=-parseInt(pivotSlider.value,10);update()};
  objectSlider.oninput=function(){state.objectY=parseInt(objectSlider.value,10)||0;update()};
  angleSlider.oninput=function(){state.theta=parseInt(angleSlider.value,10)||0;update()};
  el('stableBtn').onclick=function(){state.pivotY=-35;state.objectY=42;state.theta=22;pivotSlider.value=35;objectSlider.value=42;angleSlider.value=22;update()};
  el('neutralBtn').onclick=function(){state.objectY=42;state.pivotY=Math.round(centerY());state.theta=28;pivotSlider.value=-state.pivotY;objectSlider.value=42;angleSlider.value=28;update()};
  el('unstableBtn').onclick=function(){state.pivotY=42;state.objectY=20;state.theta=18;pivotSlider.value=-42;objectSlider.value=20;angleSlider.value=18;update()};
  el('testBtn').onclick=release;
  el('nextBtn').onclick=function(){state.index=(state.index+1)%sets.length;update()};
  document.addEventListener('gesturestart',function(e){e.preventDefault()});
  update();
})();
