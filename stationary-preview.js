'use strict';
const canvas=document.querySelector('#battle'),g=canvas.getContext('2d'),attack=document.querySelector('#attack'),scrub=document.querySelector('#scrub'),state=document.querySelector('#state');
let elapsed=-1,clock=0,last=0,playing=true,speed=1,ready=false,body,arm,liveIdle,idle;
const frame=document.createElement('iframe');frame.src='lin-approved.html?battle=1';frame.setAttribute('aria-hidden','true');frame.tabIndex=-1;frame.onload=()=>liveIdle=frame.contentDocument.querySelector('#sprite');document.body.append(frame);
const load=src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=src;});
function cut(img,x,y,w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const q=c.getContext('2d');q.drawImage(img,x,y,w,h,0,0,w,h);const d=q.getImageData(0,0,w,h);for(let n=3;n<d.data.length;n+=4)d.data[n]=d.data[n]>=96?255:0;q.putImageData(d,0,0);return c;}
Promise.all([load('stationary-rig.png'),load('lin-idle-sheet.png')]).then(([rig,base])=>{
 // All visible character parts use the approved original first pose.
 const basePose=document.createElement('canvas');basePose.width=384;basePose.height=512;
 basePose.getContext('2d').drawImage(base,0,0,384,512,0,0,384,512);
 const outline=[[137,134],[163,144],[179,192],[173,219],[159,226],[155,253],[155,290],[176,297],[176,311],[373,467],[354,470],[151,329],[138,316],[124,299],[96,274],[93,260],[102,254],[128,273],[131,250],[135,225],[119,224],[109,211],[117,186],[111,185],[122,157]];
 const trace=q=>{q.beginPath();outline.forEach(([x,y],i)=>i?q.lineTo(x,y):q.moveTo(x,y));q.closePath();};
 arm=document.createElement('canvas');arm.width=384;arm.height=512;
 const aq=arm.getContext('2d');aq.save();trace(aq);aq.clip();aq.drawImage(basePose,0,0);aq.restore();
 body=document.createElement('canvas');body.width=384;body.height=512;
 const bq=body.getContext('2d');bq.drawImage(basePose,0,0);bq.globalCompositeOperation='destination-out';trace(bq);bq.fill();bq.globalCompositeOperation='source-over';
 // Existing clean plate supplies only pixels hidden under the old weapon.
 const plate=cut(rig,0,0,768,1024);bq.save();trace(bq);bq.clip();bq.drawImage(plate,0,0,384,512);bq.restore();
 idle=document.createElement('canvas');idle.width=192;idle.height=256;const z=idle.getContext('2d');z.imageSmoothingEnabled=false;z.drawImage(basePose,0,0,192,256);
 ready=true;attack.disabled=false;draw();
}).catch(()=>state.textContent='素材加载失败，请刷新');
function monster(){let p=0;for(const t of StationaryMotion.impacts){const d=elapsed-t;if(d>=0&&d<240)p=Math.max(p,Math.sin(d/240*Math.PI));}
 g.save();g.translate(630+p*8,338);g.rotate(p*.045);g.fillStyle=p>.25?'#ac91bc':'#535469';g.fillRect(-40,-115,80,104);g.fillRect(-51,-84,18,74);g.fillRect(33,-84,18,74);g.fillRect(-33,-20,24,20);g.fillRect(9,-20,24,20);g.fillStyle='#282b3e';g.fillRect(-25,-96,50,28);g.fillStyle=p>.25?'#fff0dd':'#b995ef';g.fillRect(-20,-90,12,7);g.fillRect(8,-90,12,7);g.restore();}
function effects(){if(!document.querySelector('#effects').checked)return;
 for(const [i,start] of StationaryMotion.launches.entries()){const t=(elapsed-start)/270;if(t>=0&&t<=1){const x=330+300*t,y=231;g.save();g.translate(x,y);g.scale(1,i===0?1:-1);g.strokeStyle='#cfacff';g.lineWidth=5;g.beginPath();g.moveTo(-15,-39);g.quadraticCurveTo(32,0,-15,39);g.stroke();g.strokeStyle='#fff0ff';g.lineWidth=2;g.beginPath();g.moveTo(-8,-28);g.quadraticCurveTo(23,0,-8,28);g.stroke();g.restore();}}
 for(const start of StationaryMotion.impacts){const t=(elapsed-start)/220;if(t<0||t>1)continue;g.save();g.globalAlpha=1-t;for(let i=0;i<9;i++){const a=i*Math.PI*2/9;g.fillStyle=i%2?'#ceb0fa':'#fff0c5';g.fillRect(Math.round(625+Math.cos(a)*(8+t*38)),Math.round(234+Math.sin(a)*(8+t*38)),4,4);}g.restore();}}
function draw(){if(!ready)return;const pose=StationaryMotion.sample(elapsed);g.clearRect(0,0,800,420);g.imageSmoothingEnabled=false;g.fillStyle='#70809944';g.fillRect(40,339,720,1);g.fillStyle='#080b14aa';g.beginPath();g.ellipse(225,339,47,7,0,0,Math.PI*2);g.ellipse(630,340,55,9,0,0,Math.PI*2);g.fill();monster();
 if(pose.idle){const src=liveIdle||idle;g.drawImage(src,130,86,192,256); }else{
 // Restore the approved original stationary arm rig, with its original slight lean.
 g.save();g.translate(225,339);g.rotate(pose.lean);g.translate(-225,-339);
 g.drawImage(body,130,86,192,256);
 g.save();g.translate(130+146*.5,86+151*.5);g.rotate(pose.angle);
 g.save();g.translate(0,(218-151)*.5);g.rotate(pose.elbow);
 g.drawImage(arm,0,212,384,300,-146*.5,(212-218)*.5,192,150);g.restore();
 g.drawImage(arm,0,0,384,225,-146*.5,-151*.5,192,112.5);
 g.restore();g.restore();
 }
 effects();state.textContent=pose.label;document.querySelector('#hits').textContent=`命中 ${pose.hits} / 1`;attack.disabled=elapsed>=0&&elapsed<1500;if(elapsed>=0)scrub.value=Math.min(elapsed,1500);canvas.dataset.phase=pose.label;}
attack.onclick=()=>{elapsed=0;playing=true;document.querySelector('#pause').textContent='暂停';draw();};document.querySelector('#pause').onclick=e=>{playing=!playing;e.target.textContent=playing?'暂停':'播放';};document.querySelector('#speed').onchange=e=>speed=+e.target.value;document.querySelector('#effects').onchange=draw;scrub.oninput=e=>{elapsed=+e.target.value;playing=false;document.querySelector('#pause').textContent='播放';draw();};
function tick(t){const dt=last?Math.min(t-last,50):0;last=t;if(playing&&!document.hidden){clock+=dt;if(elapsed>=0&&elapsed<1500)elapsed=Math.min(1500,elapsed+dt*speed);}draw();requestAnimationFrame(tick);}requestAnimationFrame(tick);
