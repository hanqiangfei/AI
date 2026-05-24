(function(){
  var sets=[
    {name:'基础挑战', left:[['🍎',2],['📘',4]], right:[['🧃',3],['⚽',3]]},
    {name:'水果与文具', left:[['🍌',1],['🍉',5]], right:[['✏️',2],['📚',4]]},
    {name:'实验器材', left:[['🔋',3],['🧲',3]], right:[['🔬',4],['⚙️',2]]},
    {name:'太空补给', left:[['🚀',2],['🪐',4]], right:[['🛰️',3],['🌕',3]]}
  ];
  var state={index:0,height:0,tested:false};
  var el=function(id){return document.getElementById(id)};
  var wrap=el('balanceWrap'), beam=el('beam'), fulcrum=el('fulcrum'), slider=el('heightSlider');
  function sum(arr){var n=0;for(var i=0;i<arr.length;i++)n+=arr[i][1];return n}
  function renderItems(node,arr){node.innerHTML='';for(var i=0;i<arr.length;i++){var d=document.createElement('span');d.className='item';d.textContent=arr[i][0];var s=document.createElement('small');s.textContent=arr[i][1]+'kg';d.appendChild(s);node.appendChild(d)}}
  function stability(){var h=state.height; if(h<-45)return {grade:'不稳定',msg:'支点太低，重心像站在支点上方，轻微扰动就容易翻倒。',angle:7}; if(h<15)return {grade:'临界平衡',msg:'能保持水平，但抗扰动能力一般，轻碰一下会晃很久。',angle:2}; return {grade:'稳定平衡',msg:'支点在重心上方，像吊起来的秋千，会自己回到平衡位置。',angle:0};}
  function update(){var set=sets[state.index], left=sum(set.left), right=sum(set.right), st=stability(); el('levelName').textContent=set.name; el('targetText').textContent='左右各 '+left+'kg'; renderItems(el('leftPan'),set.left); renderItems(el('rightPan'),set.right); var y=-state.height; fulcrum.style.transform='translateY('+y+'px)'; var wiggle=state.tested?st.angle:0; beam.style.transform='rotate('+wiggle+'deg)'; el('leftTorque').textContent=left+' × L'; el('rightTorque').textContent=right+' × L'; el('angleText').textContent=wiggle+'°'; if(state.tested){el('resultText').innerHTML='测试结果：<strong>'+st.grade+'</strong>。'+st.msg}else{el('resultText').textContent='提示：左右质量相等，力矩也相等；现在请移动中心点，测试“稳不稳”。'}}
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
