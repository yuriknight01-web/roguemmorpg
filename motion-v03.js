// One registered base pose. No cross-fades or full-body frame substitution.
const sheet=new Image(),hurtAtlas=new Image(),main=document.querySelector('#sprite');
// Export the battle idle at its final display resolution to avoid a second pixel resample.
if(new URLSearchParams(location.search).get('battle')==='1'){main.width=192;main.height=256;}
const toggle=document.querySelector('#toggle'),step=document.querySelector('#step'),state=document.querySelector('#state'),frameText=document.querySelector('#frameText');
let playing=true,ready=false,time=0,last=0,speed=1,manualBlink=-10000,forcedClosed=false;
let hurtReady=false,hitStart=-10000;
const reactionCanvas=document.createElement("canvas");
reactionCanvas.style.cssText='position:absolute;top:0;left:-25%;width:150%;height:100%;image-rendering:pixelated;display:none;pointer-events:none';
main.parentElement.append(reactionCanvas);
function showDrawnHit(ms){const elapsed=ms-hitStart;if(!hurtReady||!HitFrames.sample(elapsed)){reactionCanvas.style.display='none';main.style.visibility='visible';return false;}
 // Evaluate the real approved idle at this instant, including cloth and breathing.
 // Returning to this exact canvas avoids a separate final-pose/idle switch.
 draw(ms,main,true);
 const width=Math.round(main.width*1.5);if(reactionCanvas.width!==width||reactionCanvas.height!==main.height){reactionCanvas.width=width;reactionCanvas.height=main.height;}
 const pose=HitFrames.render(reactionCanvas,main,elapsed);
 document.querySelector('#hitScrub').value=Math.min(HitFrames.duration,Math.round(elapsed/10)*10);
 main.style.visibility='hidden';reactionCanvas.style.display='block';
 state.textContent=['命中 · 闪光','受击 · 后仰','卸力','回正','回到待机'][pose.phase];frameText.textContent='单帧受击 · '+Math.round(elapsed)+' ms';return true;
}
let openPixels,closedPixels,hurtPixels,output,weights,renderContext,bindings,layerIds;
let simTime=0,gustUntil=-1;
const chains=[
 new SecondaryChain([[143,285],[123,325],[100,365],[77,407],[66,445]],{stiffness:24,damping:3.8,windGain:1.25}),
 new SecondaryChain([[225,235],[245,280],[263,330],[278,383],[285,446]],{stiffness:23,damping:3.9,windGain:1.1}),
 new SecondaryChain([[171,47],[153,65],[138,85],[126,110]],{stiffness:38,damping:4.3,windGain:1.6}),
 new SecondaryChain([[222,49],[237,74],[249,100],[266,133]],{stiffness:34,damping:4.1,windGain:1.65})
];
function advancePhysics(dt){simTime+=dt;const natural=document.querySelector('#breeze').checked;
 const wind=natural?(.6*Math.sin(simTime*.87)+.28*Math.sin(simTime*1.79+.8)+.2):0;
 const gust=simTime<gustUntil?2.6*Math.sin(Math.PI*(1-(gustUntil-simTime)/.65)):0;
 chains.forEach((c,i)=>c.step(dt,(wind+gust)*(1+i*.05)));}

const clamp=x=>Math.max(0,Math.min(1,x)),smooth=(a,b,x)=>{const v=clamp((x-a)/(b-a));return v*v*(3-2*v);};
function setup(){const w=main.width,h=main.height,c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.imageSmoothingEnabled=false;ctx.drawImage(sheet,0,0,384,512,0,0,w,h);openPixels=ctx.getImageData(0,0,w,h).data;
// Registered eyelid patch only. All remaining pixels come from pose 01.
ctx.drawImage(sheet,3*384+183,76,42,27,183*w/384,76*h/512,42*w/384,27*h/512);closedPixels=ctx.getImageData(0,0,w,h).data;
renderContext=main.getContext('2d');output=renderContext.createImageData(w,h);weights=new Float32Array(w*h*9);bindings=new Float32Array(w*h*4);layerIds=makeLayerOwnership(w,h);
for(let y=0;y<h;y++)for(let x=0;x<w;x++){const X=x*384/w,Y=y*512/h,k=(y*w+x)*9;
const along=((X-152)*218+(Y-313)*153)/(218*218+153*153);const distance=Math.abs((X-152)*153-(Y-313)*218)/Math.hypot(218,153);
const blade=(1-smooth(7,15,distance))*smooth(-.1,.02,along)*(1-smooth(1,1.08,along));
const hand=Math.exp(-((X-145)**2+(Y-287)**2)/700);const weapon=Math.max(blade,hand);
// Only free coat tails: leave waist, thighs and boots out of the deformation.
const left=(1-smooth(95,130,X))*smooth(310,430,Y)*(1-smooth(455,475,Y));
const right=smooth(225,265,X)*smooth(265,435,Y)*(1-smooth(465,490,Y));
const cloth=Math.max(left,right)*(1-weapon);
const torso=smooth(80,110,X)*(1-smooth(245,280,X))*(1-smooth(280,390,Y));
// Hair roots, crown and face stay attached; motion grows gently toward the tips.
const hair=(1-smooth(130,150,Y))*smooth(55,115,Y)*Math.max(1-smooth(135,164,X),smooth(222,265,X));
const ornament=Math.exp(-((X-218)**2/130+(Y-269)**2/500))*(1-weapon);
for(let j=0;j<4;j++)bindings[(y*w+x)*4+j]=chains[j].bind(X,Y);
weights[k]=cloth;weights[k+1]=hair;weights[k+2]=torso;weights[k+3]=weapon;weights[k+4]=X-152;weights[k+5]=Y-313;weights[k+6]=ornament;weights[k+7]=Y/512;weights[k+8]=left>right?-1:1;}}
function blinkPhase(ms){if(forcedClosed)return 1;const p=ms-manualBlink;if(p>=0&&p<500)return p<100?p/100:p<360?1:1-(p-360)/140;const q=(ms+1450)%4200;return q<100?q/100:q<360?1:q<500?1-(q-360)/140:0;}
function draw(ms,target=main,skipHit=false){if(!ready)return;if(!skipHit&&showDrawnHit(ms))return;const w=main.width,h=main.height,t=ms/1000,breath=(1-Math.cos(t*2*Math.PI/5.8))*.2,wind=Math.sin(t*2*Math.PI/3.0),angle=Math.sin(t*2*Math.PI/5.8-.25)*.009,blink=blinkPhase(ms);
// Subpixel presentation avoids the old one-row jump at each breath peak.
// 0–0.4 CSS px over 5.8 seconds; no torso resampling or scaling.
main.style.transform=`translateY(${-breath}px)`;
reactionCanvas.style.transform=main.style.transform;
const closed=blink>.6,src=closed?closedPixels:openPixels,dst=output.data;
dst.fill(0);
// Each pass samples only its own cutout. Wind can never sample foreground pixels.
function compositePixel(o,s){const sa=src[s+3]/255;if(!sa)return;const da=dst[o+3]/255,oa=sa+da*(1-sa);for(let channel=0;channel<3;channel++)dst[o+channel]=(src[s+channel]*sa+dst[o+channel]*da*(1-sa))/oa;dst[o+3]=Math.round(oa*255);}
for(let layer=1;layer<=4;layer++){
 const ci=layer-1;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=y*w+x,k=i*9,X=x*384/w,Y=y*512/h;
  const delta=chains[ci].displacement(bindings[i*4+ci],X,Y);
  const weight=layer<=2?weights[k]:weights[k+1];
  const sx=Math.round(x-delta[0]*weight*w/384),sy=Math.round(y-delta[1]*weight*h/512);
  if(sx<0||sy<0||sx>=w||sy>=h)continue;
  const sourceIndex=sy*w+sx;if(layerIds[sourceIndex]!==layer)continue;
  compositePixel(i*4,sourceIndex*4);
 }
}
// Foreground is drawn last, with only the previously approved breathing/weapon motion.
// This pass has no chain displacement term at all.
for(let y=0;y<h;y++)for(let x=0;x<w;x++){
 const i=y*w+x,k=i*9,torso=weights[k+2],weapon=weights[k+3];
 const dx=weights[k+6]*wind*2-weapon*weights[k+5]*angle;
 const dy=weapon*weights[k+4]*angle;
 const sx=Math.round(x-dx*w/384),sy=Math.round(y-dy*h/512);
 if(sx<0||sy<0||sx>=w||sy>=h)continue;
 const sourceIndex=sy*w+sx;if(layerIds[sourceIndex]!==0)continue;
 const o=i*4,s=sourceIndex*4;
 // Generated cutouts have near-opaque alpha (often 253 rather than 255).
 // Clear the moving underlayer under solid foreground instead of leaking it through.
 if(src[s+3]>=240){dst[o]=src[s];dst[o+1]=src[s+1];dst[o+2]=src[s+2];dst[o+3]=src[s+3];}
 else compositePixel(o,s);
}
renderContext.putImageData(output,0,0);state.textContent=playing?'独立发梢 / 衣摆 · 物理待机':'已暂停';frameText.textContent=closed?'闭眼':'呼吸 / 衣摆 / 刀尖';}

function startHit(hold=false){if(!ready||!hurtReady)return;forcedClosed=false;hitStart=hold?time-100:time;playing=!hold;toggle.textContent=playing?'暂停':'播放';chains.forEach(c=>c.impulse(-.32));draw(time);}
document.querySelector('#hitEnd').addEventListener('click',()=>{playing=false;toggle.textContent='播放';hitStart=time-320;draw(time);});
document.querySelector('#hitScrub').addEventListener('input',e=>{playing=false;toggle.textContent='播放';hitStart=time-Number(e.target.value);draw(time);});
document.querySelector('#hit').addEventListener('click',()=>startHit());
document.querySelector('#hitPose').addEventListener('click',()=>startHit(true));
toggle.addEventListener('click',()=>{playing=!playing;forcedClosed=false;toggle.textContent=playing?'暂停':'播放';draw(time);});
step.addEventListener('click',()=>{playing=false;forcedClosed=false;toggle.textContent='播放';time+=1000/30;advancePhysics(1/60);advancePhysics(1/60);draw(time);});
document.querySelector('#blink').addEventListener('click',()=>{manualBlink=time;forcedClosed=!playing;draw(time);});
document.querySelector('#gust').addEventListener('click',()=>{gustUntil=simTime+.65;playing=true;forcedClosed=false;toggle.textContent='暂停';});
document.querySelector('#speed').addEventListener('change',e=>speed=Number(e.target.value));
document.querySelector('#detail').addEventListener('change',e=>{main.width=Number(e.target.value);main.height=Math.round(main.width*4/3);if(ready){setup();draw(time);}});
sheet.onload=()=>{ready=true;setup();toggle.disabled=step.disabled=document.querySelector('#blink').disabled=false;if(matchMedia('(prefers-reduced-motion: reduce)').matches){playing=false;toggle.textContent='播放';}draw(0);};
sheet.onerror=()=>state.textContent='素材载入失败';sheet.src='lin-idle-sheet.png';
hurtAtlas.onload=()=>{HitFrames.load(hurtAtlas);hurtReady=true;document.querySelector('#hit').disabled=document.querySelector('#hitPose').disabled=false;};hurtAtlas.onerror=()=>{document.querySelector('#hit').textContent='受击素材载入失败';};hurtAtlas.src='lin-hurt-clean-v04.png';
let accumulator=0,physicsAccumulator=0;function tick(now){const dt=last?Math.min(100,now-last):0;last=now;if(ready&&playing&&!document.hidden){time+=dt*speed;physicsAccumulator+=dt*speed/1000;while(physicsAccumulator>=1/60){advancePhysics(1/60);physicsAccumulator-=1/60;}accumulator+=dt;if(accumulator>=1000/60){accumulator%=1000/60;draw(time);}}requestAnimationFrame(tick);}requestAnimationFrame(tick);
