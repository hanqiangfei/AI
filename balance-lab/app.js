(function(){
  var sets=[
    {name:'苹果 vs 砝码', left:['🍎',5], right:['⚖️',5]},
    {name:'书本 vs 积木', left:['📘',4], right:['🧱',4]},
    {name:'电池 vs 磁铁', left:['🔋',3], right:['🧲',3]},
    {name:'星球 vs 卫星', left:['🪐',6], right:['🛰️',6]}
  ];
  var state={index:0,d:35,theta:22,animating:false};
  var el=function(id){return document.getElementById(id)};
  var beam=el('beam'), pivot=el('pivotPoint'), connector=el('pivotConnector'), gPoint=el('gravityCenter'), dLine=el('distanceLine'), dLabel=el('dLabel'), angleGuide=el('angleGuide'), thetaLabel=el('thetaLabel');
  var hSlider=el('heightSlider'), aSlider=el('angleSlider');
  function mass(item){return item[1]}
  function renderItem(node,item){node.innerHTML='';var d=document.createElement('span');d.className='item single';d.textContent=item[0];var s=document.createElement('small');s.textContent=item[1]+'kg';d.appendChild(s);node.appendChild(d)}
  function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
  function mode(){ if(state.d>6)return 'stable'; if(state.d<-6)return 'unstable'; return 'neutral'; }
  function torque(){
    var total=mass(sets[state.index].left)+mass(sets[state.index].right);
    return -total*state.d*Math.sin(state.theta*Math.PI/180)/100;
  }
  function modeText(){
    var m=mode();
    if(m==='stable')return {grade:'稳定平衡',msg:'d > 0，支点高于系统重心/挂盘点。倾斜后 τ 与 θ 方向相反，会把横梁拉回水平。'};
    if(m==='neutral')return {grade:'随遇平衡',msg:'d ≈ 0，支点、重心、挂盘点近似三点一线。τ≈0，所以天平可在任意角度静止。'};
    return {grade:'不稳定平衡',msg:'d < 0，重心高于支点。倾斜后 τ 与 θ 同向，一碰就会继续翻倒。'};
  }
  function update(){
    var set=sets[state.index], left=mass(set.left), right=mass(set.right), info=modeText();
    el('levelName').textContent=set.name;
    el('targetText').textContent='左右各 '+left+'kg，质量相等';
    renderItem(el('leftPan'),set.left); renderItem(el('rightPan'),set.right);
    var pivotY=-state.d;
    pivot.style.transform='translateY('+pivotY+'px)';
    connector.style.transform='translateY('+pivotY+'px)';
    connector.style.height=Math.abs(state.d)+'px';
    connector.style.top=(state.d>=0?'50%':'calc(50% - '+Math.abs(state.d)+'px)');
    gPoint.style.transform='translate(-50%, -50%) rotate('+state.theta+'deg)';
    dLine.style.height=Math.abs(state.d)+'px';
    dLine.style.top=(state.d>=0?'calc(50% - '+Math.abs(state.d)+'px)':'50%');
    dLine.className='distance-line '+(state.d>=0?'positive':'negative');
    dLabel.textContent='d = '+state.d+'（O→G）';
    angleGuide.style.transform='rotate('+state.theta+'deg)';
    thetaLabel.textContent='θ = '+Math.round(state.theta)+'°';
    beam.style.transform='rotate('+state.theta+'deg)';
    el('massTorque').textContent='左右相等，净力矩 0';
    el('restoreTorque').textContent=torque().toFixed(2);
    el('angleText').textContent=Math.round(state.theta)+'°';
    el('resultText').innerHTML='当前：<strong>'+info.grade+'</strong>。图中 O=支点，G=系统重心，d=O 到 G 的竖直距离，θ=横梁相对水平线的扰动角。'+info.msg+' 公式：τ=-M·g·d·sinθ。';
  }
  function animateRelease(){
    if(state.animating)return;
    state.animating=true;
    var m=mode(), step=0;
    function tick(){
      step++;
      if(m==='stable'){
        state.theta=state.theta*0.82;
        if(Math.abs(state.theta)<0.4){state.theta=0;state.animating=false;update();return;}
      }else if(m==='neutral'){
        state.animating=false;update();return;
      }else{
        var dir=state.theta===0?1:(state.theta>0?1:-1);
        state.theta=clamp(state.theta+dir*(3+step*0.38),-82,82);
        if(Math.abs(state.theta)>=82){state.animating=false;update();return;}
      }
      aSlider.value=Math.round(state.theta);
      update();
      setTimeout(tick,70);
    }
    tick();
  }
  hSlider.oninput=function(){state.d=parseInt(hSlider.value,10)||0;update()};
  aSlider.oninput=function(){state.theta=parseInt(aSlider.value,10)||0;update()};
  el('upBtn').onclick=function(){state.d=clamp(state.d+10,-80,80);hSlider.value=state.d;update()};
  el('downBtn').onclick=function(){state.d=clamp(state.d-10,-80,80);hSlider.value=state.d;update()};
  el('testBtn').onclick=animateRelease;
  el('nextBtn').onclick=function(){state.index=(state.index+1)%sets.length;update()};
  update();
})();
