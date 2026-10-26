// One fixed hurt drawing + rigid recoil. No pose morph, scale animation or image blend.
const HitFrames=(()=>{
 let atlas;
 const duration=420,HURT_FRAME=2;
 const smooth=t=>t*t*(3-2*t);
 function sample(ms){
  if(ms<0||ms>=duration)return null;
  const amount=ms<55?1-(1-ms/55)**3:ms<125?1:1-smooth(Math.min(1,(ms-125)/295));
  return {frame:ms<280?HURT_FRAME:-1,phase:ms<55?0:ms<125?1:ms<280?3:4,amount,angle:-.09*amount,back:-12*amount};
 }
 function load(image){atlas=image;}
 function render(canvas,idle,ms){
  const p=sample(ms);if(!p)return false;
  const c=canvas.getContext('2d'),r=idle.width/384;
  c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.clearRect(0,0,canvas.width,canvas.height);c.imageSmoothingEnabled=false;
  const px=canvas.width/2+(170-192)*r,py=505*r;
  c.save();c.translate(px+p.back*r,py);c.rotate(p.angle);c.translate(-px,-py);
  if(p.frame<0)c.drawImage(idle,Math.round(idle.width*.25),0);
  else {
   const cw=atlas.naturalWidth/4,ch=atlas.naturalHeight/3,i=HURT_FRAME;
   const scale=(450/403)*r*(1254/atlas.naturalWidth),foot=417,anchor=159;
   const sx=Math.round(i*cw),sy=12,sw=Math.round((i+1)*cw)-sx,sh=foot-11;
   c.drawImage(atlas,sx,sy,sw,sh,Math.round(px-anchor*scale),Math.round(py-(foot-12)*scale),sw*scale,sh*scale);
  }
  c.restore();
  // Brief tint affects only the single current silhouette, never a duplicate sprite.
  if(ms<65){c.save();c.globalCompositeOperation='source-atop';c.globalAlpha=.55*(1-ms/65);c.fillStyle='#fff4d0';c.fillRect(0,0,canvas.width,canvas.height);c.restore();}
  // Pixel impact burst is independent of the character texture and disappears quickly.
  if(ms<165){
   const t=ms/165,cx=px+45*r,cy=235*r;
   c.save();c.globalAlpha=1-t;
   for(let j=0;j<8;j++){
    const a=j*Math.PI/4+.18,dist=(8+45*t)*r,size=Math.max(1,Math.round((5-2*t)*r));
    c.fillStyle=j%2?'#ffd36b':'#fff3d6';
    const x=Math.round(cx+Math.cos(a)*dist),y=Math.round(cy+Math.sin(a)*dist);
    c.fillRect(x,y,size,size);
    if(t<.6)c.fillRect(Math.round(x-Math.cos(a)*size*1.5),Math.round(y-Math.sin(a)*size*1.5),size,size);
   }
   if(ms<55){c.fillStyle='#fff8e2';const s=Math.max(1,Math.round(3*r));c.fillRect(Math.round(cx-14*r),Math.round(cy),Math.round(28*r),s);c.fillRect(Math.round(cx),Math.round(cy-14*r),s,Math.round(28*r));}
   c.restore();
  }
  return p;
 }
 return {load,render,sample,duration};
})();
if(typeof module!=='undefined')module.exports=HitFrames;
