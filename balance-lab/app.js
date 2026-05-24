(function(){
  var sets=[
    {name:'苹果 vs 砝码', left:['🍎',5], right:['⚖️',5]},
    {name:'书本 vs 积木', left:['📘',4], right:['🧱',4]},
    {name:'电池 vs 磁铁', left:['🔋',3], right:['🧲',3]},
    {name:'星球 vs 卫星', left:['🪐',6], right:['🛰️',6]}
  ];
  var state={index:0,height:0,tested:false};
  var el=function(id){return document.getElementById(id)};
  var wrap=el('balanceWrap'), beam=el('beam'), fulcrum=el('fulcrum'), slider=el('heightSlider');
  function mass(item){return item[1]}
  function renderItem(node,item){node.innerHTML='';var d=document.createElement('span');d.className='item single';d.textContent=item[0];var s=document.createElement('small');s.textContent=item[1]+'kg';d.appendChild(s);node.appendChild(d)}
  function stability(){var h=state.height; if(h<-45)return {grade:'不稳定',msg:'支点太低，重心像站在支点上方，轻微扰动就容易翻倒。',angle:7}; if(h<15)return {grade:'临界平衡',msg:'能保持水平，但抗扰动能力一般，轻碰一下会晃很久。',angle:2}; return {grade:'稳定平衡',msg:'支点在重心上方，像吊起来的秋千，会自己回到平衡位置。',angle:0};}
  function update(){var set=sets[state.index], left=mass(set.left), right=mass(set.right), st=stability(); el('levelName').textContent=set.name; el('targetText').textContent='左右各 '+left+'kg'; renderItem(el('leftPan'),set.left); renderItem(el('rightPan'),set.right); var y=-state.height; fulcrum.style.transform='translateY('+y+'px)'; var wiggle=state.tested?st.angle:0; beam.style.transform='translateY('+y+'px) rotate('+wiggle+'deg)'; el('leftTorque').textContent=left+' × L'; el('rightTorque').textContent=right+' × L'; el('angleText').textContent=wiggle+'°'; if(state.tested){el('resultText').innerHTML='测试结果：<strong>'+st.grade+'</strong>。'+st.msg}else{el('resultText').textContent='提示：左右各一个等质量物品，支点始终连在横梁中心；现在移动中心高度，测试“稳不稳”。'}}
  slider.oninput=function(){state.height=parseInt(slider.value,10)||0;state.tested=false;update()};
  el('upBtn').onclick=function(){state.height=Math.min(80,state.height+10);slider.value=state.height;state.tested=false;update()};
  el('downBtn').onclick=function(){state.height=Math.max(-80,state.height-10);slider.value=state.height;state.tested=false;update()};
  el('testBtn').onclick=function(){state.tested=true;update()};
  el('nextBtn').onclick=function(){state.index=(state.index+1)%sets.length;state.tested=false;update()};
  var dragging=false,startY=0,startH=0;
  wrap.addEventListener('pointerdown',function(e){dragging=true;startY=e.clientY;startH=state.height;wrap.setPointerCapture(e.pointerId)});
  wrap.addEventListener('pointermove',function(e){if(!dragging)return;state.height=Math.max(-80,Math.min(80,startH-(e.clientY-startY)));slider.value=state.height;state.tested=false;update()});
  wrap.addEventListener('pointerup',function(){dragging=false});
  update();
})();
