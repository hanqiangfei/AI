(function(){
  var canvas=document.getElementById('canvas'),ctx=canvas.getContext('2d');
  var mode=document.getElementById('mode'),obj=document.getElementById('objectDistance'),focus=document.getElementById('focusLength'),angle=document.getElementById('angle'),medium=document.getElementById('medium');
  var objectValue=document.getElementById('objectValue'),focusValue=document.getElementById('focusValue'),angleValue=document.getElementById('angleValue');
  var resultTitle=document.getElementById('resultTitle'),resultText=document.getElementById('resultText'),facts=document.getElementById('facts');
  var wraps={object:document.getElementById('objectWrap'),focus:document.getElementById('focusWrap'),angle:document.getElementById('angleWrap'),medium:document.getElementById('mediumWrap')};
  function line(x1,y1,x2,y2,color,w,dash){ctx.save();ctx.strokeStyle=color;ctx.lineWidth=w||3;if(dash){ctx.setLineDash(dash)}ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.restore()}
  function arrow(x1,y1,x2,y2,color){line(x1,y1,x2,y2,color,3);var a=Math.atan2(y2-y1,x2-x1);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-12*Math.cos(a-.45),y2-12*Math.sin(a-.45));ctx.lineTo(x2-12*Math.cos(a+.45),y2-12*Math.sin(a+.45));ctx.closePath();ctx.fill()}
  function text(t,x,y,color){ctx.fillStyle=color||'#334155';ctx.font='18px Arial';ctx.fillText(t,x,y)}
  function clear(){ctx.clearRect(0,0,920,430);line(40,215,880,215,'#94a3b8',2,[8,8])}
  function setFacts(arr){facts.innerHTML='';for(var i=0;i<arr.length;i++){var li=document.createElement('li');li.textContent=arr[i];facts.appendChild(li)}}
  function drawLens(){clear();var u=Number(obj.value),f=Number(focus.value),scale=6,lensX=470,axisY=215,objX=lensX-u*scale,objH=90;objectValue.textContent=u;focusValue.textContent=f;
    ctx.strokeStyle='#2563eb';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(lensX,axisY,18,145,0,0,Math.PI*2);ctx.stroke();text('凸透镜',lensX-28,55,'#1d4ed8');
    line(lensX-f*scale,205,lensX-f*scale,225,'#f59e0b',3);line(lensX+f*scale,205,lensX+f*scale,225,'#f59e0b',3);text('F',lensX-f*scale-6,195,'#b45309');text('F',lensX+f*scale-6,195,'#b45309');
    arrow(objX,axisY,objX,axisY-objH,'#ef4444');text('物体',objX-20,axisY-objH-12,'#ef4444');
    arrow(objX,axisY-objH,lensX,axisY-objH,'#ef4444');arrow(lensX,axisY-objH,lensX+260,axisY+90,'#2563eb');
    arrow(objX,axisY-objH,lensX,axisY,'#ef4444');arrow(lensX,axisY,lensX+310,axisY-120,'#2563eb');
    var title='凸透镜成像结果',msg='',arr=[];
    if(u===f){msg='物体在焦点上，折射光近似平行，屏幕上接不到清晰像。';setFacts(['规律：u = f 时不成清晰像。','把物体稍微远离焦点，就能重新得到实像。']);}
    else{var v=1/(1/f-1/u),m=Math.abs(v/u),real=v>0,imgX=lensX+v*scale;if(!real){imgX=lensX+v*scale}
      var imgH=objH*(v/u);arrow(imgX,axisY,imgX,axisY-imgH,'#16a34a');text('像',imgX-8,axisY-imgH-12,'#16a34a');line(lensX,axisY-objH,imgX,axisY-imgH,'#16a34a',2,[5,7]);
      if(real){msg='像距约 '+Math.abs(v).toFixed(1)+' cm，形成倒立、'+(m>1?'放大':m<1?'缩小':'等大')+'、实像。'}else{msg='像距约 '+Math.abs(v).toFixed(1)+' cm（与物体同侧），形成正立、放大、虚像。'}
      arr=['公式：1/f = 1/u + 1/v。','放大率约 '+m.toFixed(2)+' 倍。',u>2*f?'u > 2f：倒立缩小实像。':(u>f?'f < u < 2f：倒立放大实像。':'u < f：正立放大虚像。')];setFacts(arr)}
    resultTitle.textContent=title;resultText.textContent=msg;
  }
  function drawMirror(){clear();var mirrorX=470,axisY=215,d=Number(obj.value),scale=5,objX=mirrorX-d*scale,imgX=mirrorX+d*scale;objectValue.textContent=d;ctx.fillStyle='#93c5fd';ctx.fillRect(mirrorX-5,70,10,290);text('平面镜',mirrorX-28,55,'#1d4ed8');arrow(objX,axisY,objX,axisY-90,'#ef4444');arrow(imgX,axisY,imgX,axisY-90,'#16a34a');line(objX,axisY-90,mirrorX,150,'#ef4444',3);line(mirrorX,150,objX,210,'#2563eb',3);line(mirrorX,150,imgX,axisY-90,'#16a34a',2,[6,6]);text('物体',objX-22,105,'#ef4444');text('虚像',imgX-22,105,'#16a34a');resultTitle.textContent='平面镜成像结果';resultText.textContent='像与物体关于镜面对称：正立、等大、虚像，像距等于物距。';setFacts(['物距 = '+d+' cm，像距 = '+d+' cm。','镜中的左右会发生视觉上的反向。','平面镜成像不能用光屏承接。'])}
  function drawRefraction(){clear();var axisY=215,a=Number(angle.value),n2=Number(medium.value),n1=1,rad=a*Math.PI/180,sin2=n1*Math.sin(rad)/n2;if(sin2>1)sin2=1;var b=Math.asin(sin2)*180/Math.PI;angleValue.textContent=a;ctx.fillStyle='rgba(96,165,250,.18)';ctx.fillRect(40,215,840,175);line(460,60,460,370,'#64748b',2,[8,8]);line(40,215,880,215,'#2563eb',4);var x1=460-180*Math.sin(rad),y1=215-180*Math.cos(rad);var x2=460+180*Math.sin(b*Math.PI/180),y2=215+180*Math.cos(b*Math.PI/180);arrow(x1,y1,460,215,'#ef4444');arrow(460,215,x2,y2,'#2563eb');text('空气 n=1.00',70,100,'#334155');text('第二介质 n='+n2.toFixed(2),70,260,'#1d4ed8');resultTitle.textContent='光的折射结果';resultText.textContent='折射角约 '+b.toFixed(1)+'°。进入折射率更大的介质时，光线会向法线偏折。';setFacts(['斯涅尔定律：n₁ sinθ₁ = n₂ sinθ₂。','入射角：'+a+'°；折射角：'+b.toFixed(1)+'°。','法线是与分界面垂直的参考线。'])}
  function render(){var m=mode.value;wraps.object.className=m==='refraction'?'hidden':'';wraps.focus.className=m==='lens'?'':'hidden';wraps.angle.className=m==='refraction'?'':'hidden';wraps.medium.className=m==='refraction'?'':'hidden';if(m==='lens')drawLens();if(m==='mirror')drawMirror();if(m==='refraction')drawRefraction()}
  var els=[mode,obj,focus,angle,medium];for(var i=0;i<els.length;i++){els[i].oninput=render;els[i].onchange=render}
  var buttons=document.querySelectorAll('[data-answer]'),feedback=document.getElementById('feedback');for(var j=0;j<buttons.length;j++){buttons[j].onclick=function(){feedback.textContent=this.getAttribute('data-answer')==='A'?'答对啦：物距大于 2f 时，是倒立、缩小、实像。':'再想想：这时像在 f 和 2f 之间，是倒立、缩小、实像。'}}
  render();
})();
