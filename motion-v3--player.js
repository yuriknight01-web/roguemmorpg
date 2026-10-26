(() => {
 'use strict';
 const jin=new URLSearchParams(location.search).get('actor')==='jin';
 const image=(src,rect,scale,anchor,foot)=>({src,rect,scale,anchor,foot});
 const idle=image('roster-assets--character-'+(jin?'14':'13')+'.png',[0,0,512,1024],jin?.28:.32,jin?180:220,jin?957:981);
 const sheet='motion-v3--jin-running-identity.png';
 const art=jin?[
 idle,image(sheet,[0,0,530,510],.50,190,488),image(sheet,[530,0,540,510],.50,130,488),image(sheet,[1060,0,476,510],.50,150,495),image(sheet,[0,530,540,480],.50,65,415),image(sheet,[540,530,585,480],.50,100,415),image(sheet,[1070,530,466,480],.50,100,425)
 ]:[idle,...['ready','recover','halfdraw','draw','release'].map((id,i)=>image('motion-v3--shuangling-'+id+'-identity.png',null,[.27,.23,.24,.24,.24][i],[510,650,670,670,670][i],[995,995,985,985,985][i]))];
 // Art index, readable stage, duration, start/end stage displacement. No image mirroring.
 const steps=jin?[[0,'待机',350,0,0],[1,'蹬地起跑',110,0,50],[2,'迈步接近',130,50,145],[3,'踏步抬剑 · 右手',150,145,210],[5,'转身随势 · 右手',130,210,225],[6,'收剑稳定',220,225,225],[6,'退回原位',350,225,0],[0,'待机',600,0,0]]:[[0,'原始待机',350,0,0],[1,'攻击准备',170,0,0],[2,'下压重心',150,0,0],[3,'拉弦过渡',150,0,0],[4,'瞄准蓄力',360,0,0],[5,'松弦射击',130,0,0],[2,'收手起身',180,0,0],[1,'收势',180,0,0],[0,'待机',600,0,0]];
 let time=0,playing=false,last=0,loaded=false;const total=steps.reduce((n,s)=>n+s[2],0),ctx=document.querySelector('#stage').getContext('2d'),scrub=document.querySelector('#scrub'),status=document.querySelector('#state');scrub.max=total;
 document.querySelector('#title').textContent=jin?'烬 · 右手奔袭下斩':'霜翎 · 连贯蹲射';
 document.querySelector('#desc').textContent=jin?'跑动接近 → 踏步抬剑 → 右手下斩 → 身体转向随势 → 收剑回位。保留原来的武器设定，不添加剑鞘。':'沿用最新蹲射造型补入准备、重心下压、拉弦、松弦与起身帧。';
 if(jin)document.querySelector('#reference').innerHTML='<a href="https://www.youtube.com/shorts/p2ML-BkBv4o" target="_blank">动作参考视频</a> · <a href="roster-attack.html?actor=14">查看保留的旧版十字斩</a>';
 const start=i=>steps.slice(0,i).reduce((n,s)=>n+s[2],0);
 function index(){let t=0;for(let i=0;i<steps.length;i++){t+=steps[i][2];if(time<t)return i;}return steps.length-1;}
 function draw(){if(!loaded)return;const i=index(),st=steps[i],a=art[st[0]],r=a.rect||[0,0,a.im.width,a.im.height],u=Math.max(0,Math.min(1,(time-start(i))/st[2])),e=u*u*(3-2*u),offset=st[3]+(st[4]-st[3])*e;
 ctx.clearRect(0,0,1000,440);ctx.fillStyle='#192538';ctx.fillRect(0,0,1000,440);ctx.strokeStyle='#43536a';ctx.beginPath();ctx.moveTo(30,375);ctx.lineTo(970,375);ctx.stroke();ctx.fillStyle='#0d1727';ctx.beginPath();ctx.ellipse(300+offset,380,100,8,0,0,Math.PI*2);ctx.fill();
 ctx.imageSmoothingEnabled=false;ctx.save();
 if(jin&&(st[0]===5||st[0]===6)){const points=st[0]===5?[[540,530],[1070,530],[1070,800],[1125,850],[1125,1010],[540,1010]]:[[1070,530],[1536,530],[1536,1010],[1125,1010],[1125,870],[1070,800]];ctx.beginPath();points.forEach((p,n)=>ctx[n?'lineTo':'moveTo'](270+offset-a.anchor*a.scale+(p[0]-r[0])*a.scale,375-a.foot*a.scale+(p[1]-r[1])*a.scale));ctx.closePath();ctx.clip();}
 ctx.drawImage(a.im,...r,270+offset-a.anchor*a.scale,375-a.foot*a.scale,r[2]*a.scale,r[3]*a.scale);ctx.restore();
 if(document.querySelector('#compare').checked){const ref=art[0];ctx.drawImage(ref.im,...ref.rect,790-ref.anchor*ref.scale,375-ref.foot*ref.scale,ref.rect[2]*ref.scale,ref.rect[3]*ref.scale);ctx.fillStyle='#b4c3d8';ctx.font='15px system-ui';ctx.fillText(window.SiteUI?SiteUI.t('原始待机 · 尺寸与细节对照'):'原始待机 · 尺寸与细节对照',680,410);}
 if(!jin&&i===5){const x=510+u*290;ctx.strokeStyle='#b8eaff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-35,210);ctx.lineTo(x,210);ctx.stroke();}
 status.textContent=(i+1)+'/'+steps.length+' · '+st[1];scrub.value=time;document.querySelectorAll('#frames button').forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));}
 function jump(i){playing=false;time=start(Math.max(0,Math.min(steps.length-1,i)));draw();}
 steps.forEach((s,i)=>{const b=document.createElement('button');b.textContent=(i+1)+'. '+s[1];b.onclick=()=>jump(i);document.querySelector('#frames').append(b);});
 document.querySelector('#compare').onchange=draw;
 document.querySelector('#play').onclick=()=>{time=0;playing=true;};document.querySelector('#pause').onclick=()=>playing=!playing;document.querySelector('#prev').onclick=()=>jump(index()-1);document.querySelector('#next').onclick=()=>jump(index()+1);scrub.oninput=()=>{time=+scrub.value;playing=false;draw();};
 Promise.all(art.map(async a=>{const get=src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error(src));im.src=src;});a.im=await get(a.src);if(a.src.includes('identity')){const maskSrc=a.src==='motion-v3--jin-running-identity.png'?'motion-v3--jin-running-sheet.png':a.src.replace('-identity.png','.png');const mask=await get(maskSrc),surface=document.createElement('canvas');surface.width=a.im.width;surface.height=a.im.height;const c=surface.getContext('2d');c.drawImage(a.im,0,0);c.globalCompositeOperation='destination-in';c.drawImage(mask,0,0,surface.width,surface.height);a.im=surface;}})).then(()=>{loaded=true;draw();}).catch(e=>status.textContent='素材加载失败：'+e.message);
 function tick(now){const dt=Math.min(50,now-(last||now));last=now;if(loaded&&playing){time+=dt*Number(document.querySelector('#speed').value);if(time>=total){time=total;playing=false;}draw();}requestAnimationFrame(tick);}requestAnimationFrame(tick);
 window.addEventListener('languagechange',draw);
})();
