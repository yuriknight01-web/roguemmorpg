// Roster-only tuning: does not change the approved Lin physics.
function createRosterPart(rect,kind='cloth'){
 const root=[(rect[0]+rect[2])/2,rect[1]],len=rect[3]-rect[1],hair=kind==='hair';
 return {rect,kind,bindings:new Float32Array(128*256),chain:new SecondaryChain([root,[root[0],root[1]+len*.5],[root[0],rect[3]]],{
  stiffness:hair?34:26,damping:hair?4.6:5,windGain:(hair?290:300)/len,limit:hair?.28:.18
 })};
}
// Rigid breathing transform: preserves all distances inside the body.
function rosterBreath(seconds,id=0){
 const phase=seconds*Math.PI*2/3.8+id*.37;
 return {y:-(1-Math.cos(phase))*.325,angle:Math.sin(phase)*.0012,drive:Math.cos(phase)*.16};
}
function rosterWind(seconds){return .6*Math.sin(seconds*1.3)+.23*Math.sin(seconds*2.1+.35);}
function rosterPartDisplacement(part,binding,x,y){
 const r=part.rect,delta=part.chain.displacement(binding,x,y);
 // The chain already increases displacement toward the tip. Only pin the root
 // band instead of attenuating the whole length a second time.
 const t=Math.max(0,Math.min(1,(y-r[1])/((r[3]-r[1])*.24))),pin=t*t*(3-2*t),limit=part.kind==='hair'?8:12;
 return delta.map(v=>Math.max(-limit,Math.min(limit,v*pin))/4);
}
if(typeof module!=='undefined')module.exports={createRosterPart,rosterWind,rosterPartDisplacement,rosterBreath};
