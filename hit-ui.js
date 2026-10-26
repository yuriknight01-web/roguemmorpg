(() => {
const $=id=>document.getElementById(id),frame=$('linFrame');
const isLin=()=>!frame.hidden;const inner=id=>frame.contentDocument?.getElementById(id);
frame.addEventListener('load',()=>{if(isLin())attachStudioFrame(frame,true);});
const buttons={hit:'hit',hold:'hitPose',blink:'blink',breeze:'gust',play:'toggle'};
for(const [out,inside] of Object.entries(buttons))$(out).addEventListener('click',e=>{if(!isLin())return;e.stopImmediatePropagation();inner(inside)?.click();},true);
for(const [out,inside,type] of [['speed','speed','change'],['wind','breeze','change'],['progress','hitScrub','input']])$(out).addEventListener(type,e=>{if(!isLin())return;e.stopImmediatePropagation();const target=inner(inside);if(target){if(out==='wind')target.checked=e.target.checked;else target.value=e.target.value;target.dispatchEvent(new Event(type,{bubbles:true}));}},true);
function sync(){if(isLin()){for(const [out,inside] of Object.entries(buttons))$(out).disabled=!inner(inside)||inner(inside).disabled;const state=inner('state'),toggle=inner('toggle'),range=inner('hitScrub');if(state&&$('motionState').textContent!==state.textContent)$('motionState').textContent=state.textContent;if(toggle&&$('play').textContent!==toggle.textContent)$('play').textContent=toggle.textContent;if(range)$('progress').value=range.value;}requestAnimationFrame(sync);}sync();
})();
