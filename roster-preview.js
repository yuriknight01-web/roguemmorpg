'use strict';
const ASSET='roster-assets--',canvas=document.querySelector('#actor'),ctx=canvas.getContext('2d');
const state=document.querySelector('#motionState'),nameLabel=document.querySelector('#name'),roleLabel=document.querySelector('#role');
const cache=new Map();let roster=[],active=null,actor=null,clock=0,last=0,playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,speed=1,hitStart=-Infinity,blinkStart=-Infinity,windUntil=-Infinity,loadToken=0;
const make=(w=128,h=256)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=t=>t*t*(3-2*t);
function inside(x,y,r){return x>=r[0]&&y>=r[1]&&x<r[2]&&y<r[3];}
async function imageFor(c){if(!cache.has(c.id))cache.set(c.id,new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error(c.name+'素材载入失败'));im.src=ASSET+c.file;}));return cache.get(c.id);}
// Reject disconnected remnants of a neighboring column at an atlas boundary.
// Keep the main connected silhouette and every interior floating accessory.
function cleanCell(target){
 const g=target.getContext('2d'),im=g.getImageData(0,0,128,256),d=im.data,seen=new Uint8Array(32768),groups=[];
 for(let seed=0;seed<32768;seed++){if(seen[seed]||d[seed*4+3]<96)continue;const queue=[seed];seen[seed]=1;let edge=false;
  for(let j=0;j<queue.length;j++){const i=queue[j],x=i%128,y=Math.floor(i/128);if(x<=1||x>=126)edge=true;
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=x+dx,Y=y+dy;if(X<0||X>=128||Y<0||Y>=256)continue;const n=Y*128+X;if(!seen[n]&&d[n*4+3]>=96){seen[n]=1;queue.push(n);}}
  }groups.push({queue,edge});
 }
 const biggest=Math.max(0,...groups.map(g=>g.queue.length));
 for(const group of groups)if(group.edge&&group.queue.length<biggest*.12){for(const i of group.queue){d[i*4+3]=0;const x=i%128,y=Math.floor(i/128);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=x+dx,Y=y+dy;if(X>=0&&X<128&&Y>=0&&Y<256&&d[(Y*128+X)*4+3]<96)d[(Y*128+X)*4+3]=0;}}}
 g.putImageData(im,0,0);
}
function prepare(c,im){
 const open=make(),closed=make(),hurt=make();
 for(const [col,target] of [[0,open],[0,closed],[2,hurt]]){const g=target.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(im,col*512,0,512,1024,0,0,128,256);}
 [open,closed,hurt].forEach(cleanCell);
 const [x,y,w,h]=c.eyes,[dx,dy]=c.blinkOffset,g=closed.getContext('2d');g.imageSmoothingEnabled=false;
 // Copy only eyelids, never switch the whole idle drawing.
 g.drawImage(im,512+x+dx,y+dy,w,h,x/4,y/4,w/4,h/4);
 const pixels=[open,closed].map(t=>t.getContext('2d').getImageData(0,0,128,256).data),ownership=new Uint8Array(128*256);
 const parts=c.regions.map((r,i)=>createRosterPart(r,c.motionKinds[i]));
 // Each layer needs its own binding even just outside its original cutout.
 // Reusing another layer's binding clipped displaced tips at the old boundary.
 for(const p of parts)for(let yy=0;yy<256;yy++)for(let xx=0;xx<128;xx++)p.bindings[yy*128+xx]=p.chain.bind(xx*4,yy*4);
 for(let yy=0;yy<256;yy++)for(let xx=0;xx<128;xx++){const X=xx*4,Y=yy*4,i=yy*128+xx;const floating=c.floats.findIndex(r=>inside(X,Y,r));if(floating>=0){ownership[i]=parts.length+1+floating;continue;}const k=parts.findIndex(p=>inside(X,Y,p.rect));if(k>=0){ownership[i]=k+1;}}
 // Pin every cutout attachment where opaque art continues into the body.
 // Transparent silhouette edges remain free; rectangular cuts through fabric do not.
 for(let k=0;k<parts.length;k++){
  const weights=new Float32Array(32768).fill(1),layer=k+1;
  for(let y=1;y<255;y++)for(let x=1;x<127;x++){
   const i=y*128+x;if(ownership[i]!==layer||pixels[0][i*4+3]<96)continue;
   const joined=[i-1,i+1,i-128,i+128].some(n=>ownership[n]!==layer&&pixels[0][n*4+3]>=96);
   if(!joined)continue;
   for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){
    const X=x+dx,Y=y+dy;if(X<0||X>=128||Y<0||Y>=256)continue;
    const n=Y*128+X,t=Math.min(1,Math.hypot(dx,dy)/4);weights[n]=Math.min(weights[n],smooth(t));
   }
  }parts[k].attachmentWeights=weights;
 }
 return {open,closed,hurt,pixels,ownership,parts,output:make(),buffer:new ImageData(128,256)};
}
function simulate(dt){if(!actor)return;const t=clock/1000,wind=document.querySelector('#wind').checked?rosterWind(t):0;actor.parts.forEach(p=>p.chain.step(dt,wind+rosterBreath(t,active.id).drive+(clock<windUntil?1.7:0)));}
function idleImage(){
 const elapsed=clock-blinkStart,natural=(clock+active.id*319)%4100,blink=(elapsed>=0&&elapsed<360)||(natural<280);
 const src=actor.pixels[blink?1:0],dst=actor.buffer.data;dst.fill(0);
 const time=clock/1000,total=actor.parts.length+active.floats.length;
 function copy(i,s){const alpha=src[s*4+3];if(!alpha)return;const o=i*4,ss=s*4;if(alpha>=240){for(let k=0;k<4;k++)dst[o+k]=src[ss+k];return;}const a=alpha/255,b=dst[o+3]/255,out=a+b*(1-a);for(let k=0;k<3;k++)dst[o+k]=(src[ss+k]*a+dst[o+k]*b*(1-a))/out;dst[o+3]=out*255;}
 for(let layer=1;layer<=total;layer++)for(let y=0;y<256;y++)for(let x=0;x<128;x++){
  const i=y*128+x;let dx=0,dy=0;
  if(layer<=actor.parts.length){const p=actor.parts[layer-1],delta=rosterPartDisplacement(p,p.bindings[i],x*4,y*4);dx=delta[0]*p.attachmentWeights[i];dy=delta[1]*p.attachmentWeights[i];}
  else {dy=Math.sin(time*1.7+layer)*1.2;dx=Math.sin(time*.8+layer)*.3;}
  const sx=Math.round(x-dx),sy=Math.round(y-dy);if(sx<0||sy<0||sx>=128||sy>=256)continue;const s=sy*128+sx;if(actor.ownership[s]===layer)copy(i,s);
 }
 // Body, joints, face and weapons retain their exact source coordinates.
 // Row-rounded breathing used to shift adjacent torso rows differently, causing tears.
 for(let i=0;i<32768;i++)if(actor.ownership[i]===0)copy(i,i);
 actor.output.getContext('2d').putImageData(actor.buffer,0,0);return actor.output;
}
function reaction(ms){if(ms<0||ms>=420)return null;const amount=ms<55?1-(1-ms/55)**3:ms<125?1:1-smooth(clamp((ms-125)/295,0,1));return {amount,hurt:ms<280};}
function draw(){
 if(!actor||active.id===4)return;
 const idle=idleImage(),ms=clock-hitStart,hit=reaction(ms),useHurt=hit&&hit.hurt,cell=active.cells[useHurt?2:0];
 const bodyTop=Math.max(active.cells[0].bounds[1],active.eyes[1]-60),scale=active.height/(active.cells[0].foot-bodyTop),anchor=128,ground=242;
 ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,256,256);ctx.imageSmoothingEnabled=false;
 const breathing=rosterBreath(clock/1000,active.id),breathWeight=hit?1-hit.amount:1;
 ctx.save();ctx.translate(anchor-(hit?hit.amount*5:0),ground+breathing.y*breathWeight);ctx.rotate(breathing.angle*breathWeight);if(hit)ctx.rotate(-.09*hit.amount);if(active.flip)ctx.scale(-1,1);
 ctx.drawImage(useHurt?actor.hurt:idle,-cell.anchor*scale,-cell.foot*scale,512*scale,1024*scale);ctx.restore();
 if(hit&&ms<65){ctx.save();ctx.globalCompositeOperation='source-atop';ctx.globalAlpha=.55*(1-ms/65);ctx.fillStyle='#fff4d0';ctx.fillRect(0,0,256,256);ctx.restore();}
 if(hit&&ms<165){const t=ms/165,cx=155,cy=137;ctx.save();ctx.globalAlpha=1-t;for(let j=0;j<8;j++){const a=j*Math.PI/4+.18,d=4+23*t;ctx.fillStyle=j%2?'#ffd36b':'#fff8df';ctx.fillRect(Math.round(cx+Math.cos(a)*d),Math.round(cy+Math.sin(a)*d),2,2);}if(ms<55){ctx.fillRect(cx-9,cy,18,2);ctx.fillRect(cx,cy-9,2,18);}ctx.restore();}
 state.textContent=hit?(useHurt?'单帧受击 · 后仰':'恢复待机'):(playing?'待机 · 呼吸 / 眨眼 / 发梢 / 衣摆':'已暂停');
 document.querySelector('#progress').value=hit?Math.min(420,Math.round(ms)):0;
 canvas.dataset.character=String(active.id);canvas.dataset.mode=hit?'hurt':'idle';
}
async function select(id){
 playing=!matchMedia('(prefers-reduced-motion: reduce)').matches;document.querySelector('#play').textContent=playing?'暂停':'播放';
 const token=++loadToken;active=roster.find(c=>c.id===id);actor=null;hitStart=blinkStart=-Infinity;
 document.querySelectorAll('.character').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.id)===id)));
 nameLabel.textContent=String(id).padStart(2,'0')+' · '+active.name;roleLabel.textContent=active.role;
 const lin=id===4;document.querySelector('#standard').hidden=lin;document.querySelector('#linFrame').hidden=!lin;
 if(lin){document.querySelector('#linFrame').src='lin-approved.html?v=slow-breath-2';state.textContent='凛 · 已确认原版';return;}
 document.querySelector('#linFrame').src='about:blank';state.textContent='载入 '+active.name+'…';ctx.clearRect(0,0,256,256);
 for(const el of document.querySelectorAll('.action'))el.disabled=true;
 try{const im=await imageFor(active);if(token!==loadToken)return;actor=prepare(active,im);for(const el of document.querySelectorAll('.action'))el.disabled=false;draw();}catch(e){if(token===loadToken)state.textContent=e.message;}
}
function startHit(hold=false){if(!actor)return;hitStart=hold?clock-100:clock;playing=!hold;document.querySelector('#play').textContent=playing?'暂停':'播放';actor.parts.forEach(p=>p.chain.impulse(-.2));draw();}
document.querySelector('#hit').onclick=()=>startHit();document.querySelector('#hold').onclick=()=>startHit(true);
document.querySelector('#play').onclick=()=>{playing=!playing;document.querySelector('#play').textContent=playing?'暂停':'播放';draw();};
document.querySelector('#blink').onclick=()=>{blinkStart=clock;draw();};
document.querySelector('#breeze').onclick=()=>{windUntil=clock+700;playing=true;document.querySelector('#play').textContent='暂停';};
document.querySelector('#speed').onchange=e=>speed=Number(e.target.value);
document.querySelector('#progress').oninput=e=>{playing=false;hitStart=clock-Number(e.target.value);document.querySelector('#play').textContent='播放';draw();};
let physics=0,paint=0;function tick(now){const dt=last?Math.min(80,now-last):0;last=now;if(playing&&!document.hidden){clock+=dt*speed;physics+=dt*speed/1000;while(physics>=1/60){simulate(1/60);physics-=1/60;}paint+=dt;if(paint>=1000/30){draw();paint%=1000/30;}}requestAnimationFrame(tick);}requestAnimationFrame(tick);
async function boot(){
 try{const response=await fetch(ASSET+'roster.json');if(!response.ok)throw Error('角色列表载入失败');roster=await response.json();
 for(const c of roster){const button=document.createElement('button');button.className='character';button.dataset.id=c.id;button.setAttribute('aria-label',String(c.id).padStart(2,'0')+' '+c.name);button.setAttribute('aria-pressed','false');const thumb=make(32,56);button.append(thumb);const label=document.createElement('span');label.textContent=String(c.id).padStart(2,'0')+' '+c.name;const small=document.createElement('small');small.textContent=c.role;label.append(small);button.append(label);button.onclick=()=>select(c.id);document.querySelector('#characters').append(button);
 if(c.id!==4)imageFor(c).then(im=>{const g=thumb.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(im,0,0,512,1024,2,0,28,56);button.dataset.loaded='true';}).catch(()=>{button.dataset.loaded='false';});else{const im=new Image();im.onload=()=>{thumb.getContext('2d').drawImage(im,0,0,384,512,0,0,32,56);button.dataset.loaded='true';};im.src='lin-idle-sheet.png';}}
 const requested=Number(new URLSearchParams(location.search).get('actor'));
 await select(roster.some(c=>c.id===requested)?requested:1);
 }catch(e){state.textContent=e.message;}
}
boot();

// Same-origin attack previews share playback controls with this idle renderer.
window.setRosterPlayback=function(options){
 playing=Boolean(options.playing);
 if(Number.isFinite(options.speed)&&options.speed>0)speed=options.speed;
 document.querySelector('#play').textContent=playing?'暂停':'播放';
 document.querySelector('#speed').value=String(speed);
 draw();
};
