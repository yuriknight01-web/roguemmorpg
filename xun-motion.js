(() => {
 'use strict';
 const specs=[['idle','原始待机',420],['lowready','双手托枪',180],['raise','抬枪贴肩',150],['aim','瞄准',380],['recoil','开火后坐',90],['aim','重新稳定',150],['raise','放低枪口',160],['lowready','收枪',180],['idle','回到待机',700]];
 // Uniform scale per pose calibrated to head size, not changing pose height.
 const align={idle:[.32,180,964],lowready:[.25,200,1185],raise:[.25,200,1185],aim:[.25,200,1185],recoil:[.25,200,1185]};
 const duration=specs.reduce((n,s)=>n+s[2],0), frames=[];
 const canvas=document.querySelector('#stage'), ctx=canvas.getContext('2d'), range=document.querySelector('#scrub'), label=document.querySelector('#state');
 let time=0, playing=false, previous=0, loaded=false;
 range.max=duration;
 function frameIndex(t){let end=0;for(let i=0;i<specs.length;i++){end+=specs[i][2];if(t<end)return i;}return specs.length-1;}
 function frameStart(i){return specs.slice(0,i).reduce((n,s)=>n+s[2],0);}
 function draw(){if(!loaded)return;const i=frameIndex(time),im=frames[i],idle=specs[i][0]==='idle';
  ctx.clearRect(0,0,1000,460);ctx.fillStyle='#172234';ctx.fillRect(0,0,1000,460);
  ctx.strokeStyle='#3d4b60';ctx.beginPath();ctx.moveTo(30,385);ctx.lineTo(970,385);ctx.stroke();
  ctx.fillStyle='#0c1320';ctx.beginPath();ctx.ellipse(338,389,138,10,0,0,Math.PI*2);ctx.fill();
  ctx.imageSmoothingEnabled=false;
  const [scale,footX,footY]=align[specs[i][0]],x=270-footX*scale,y=385-footY*scale;
  if(idle)ctx.drawImage(im,0,0,512,1024,x,y,512*scale,1024*scale);
  else ctx.drawImage(im,x,y,im.width*scale,im.height*scale);
  // Projectile travels after the release; character images are never blended or stretched.
  const shot=frameStart(4),dt=time-shot;if(dt>=0&&dt<210){const x=530+dt*1.5;ctx.strokeStyle='#cff5ff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-42,154);ctx.lineTo(x,154);ctx.stroke();ctx.fillStyle='#b1eaff';ctx.beginPath();ctx.moveTo(x+8,154);ctx.lineTo(x-4,150);ctx.lineTo(x-4,158);ctx.fill();}
  label.textContent=`${i+1}/${specs.length} · ${specs[i][1]}`;range.value=time;
  document.querySelectorAll('#frames button').forEach((b,j)=>b.classList.toggle('active',j===i));
 }
 function jump(i){playing=false;time=frameStart(Math.max(0,Math.min(specs.length-1,i)));draw();}
 document.querySelector('#play').onclick=()=>{time=0;playing=true;};
 document.querySelector('#pause').onclick=()=>{playing=!playing;};
 document.querySelector('#prev').onclick=()=>jump(frameIndex(time)-1);
 document.querySelector('#next').onclick=()=>jump(frameIndex(time)+1);
 range.oninput=()=>{playing=false;time=Number(range.value);draw();};
 Promise.all(specs.map(([id,name],i)=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{frames[i]=im;resolve();};im.onerror=()=>reject(new Error('无法加载 '+id));im.src=id==='idle'?'roster-assets--character-05.png':'ranged-frames-v1--xun-'+id+'.png';}))).then(()=>{
  loaded=true;document.querySelector('#loadStatus').textContent='4 张独立动作图 + 原始待机；全身换帧，无分层拉扯、重影混合或非等比缩放。';
  specs.forEach(([id,name],i)=>{const b=document.createElement('button');b.textContent=`${i+1}. ${name}`;b.onclick=()=>jump(i);if(id!=='idle'){const img=document.createElement('img');img.src=frames[i].src;img.alt=name;b.prepend(img);}document.querySelector('#frames').append(b);});draw();
 }).catch(e=>{document.querySelector('#loadStatus').textContent=e.message;});
 function tick(now){const elapsed=Math.min(50,now-(previous||now));previous=now;if(playing&&loaded){time+=elapsed*Number(document.querySelector('#speed').value);if(time>=duration){time=duration;playing=false;}draw();}requestAnimationFrame(tick);}requestAnimationFrame(tick);
})();
