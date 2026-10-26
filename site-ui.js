(() => {
'use strict';
if(window.SiteUI)return;
const phrases={
'新版角色动作':'Character Motion','凛 · 像素待机样片':'Lin · Idle Preview','角色 · 攻击试作':'Character Attack Preview','隼 · 射击动作预览':'Xun · Shooting Preview','抬手 · 蓄力':'Raise Weapon · Wind Up','准备出手':'Ready to Attack','出手 · 收力':'Attack · Follow Through','收招 · 恢复待机':'Recover · Return to Idle',
'角色攻击动作预览':'Character Attack Preview','凛原地挥剑战斗预览':'Lin Sword Attack Preview','角色攻击动作':'Character Attack Animation','凛 · 已确认的原版动作':'Lin · Approved Motion','凛的动态像素待机':'Lin Pixel Idle','凛的待机动画':'Lin Idle Animation','当前角色动画':'Character Animation','新版动作预览':'Character Motion Preview','隼射击动作':'Xun Shooting Animation','动作时间':'Animation Timeline','载入':'Loading','素材载入失败，请刷新':'Artwork failed to load. Please refresh.',
'十五人 · 像素动作预览':'Character Studio','选择角色，查看待机与单帧受击。凛保留已确认的原版效果。':'Select a character to preview idle and hit reactions.',
'待机与受击':'Idle & Hit Reactions','角色动作馆':'Attack Gallery','角色阵容':'Characters','选择角色':'Choose a character','攻击动作':'Attacks','每名角色独立素材':'Individual character artwork','固定比例 · 单帧受击':'Fixed proportions · Single-pose hit reaction',
'播放攻击':'Play Attack','暂停 / 继续':'Pause / Resume','查看受击姿态':'Hold Hit Pose','观察眨眼':'Blink','轻吹一下':'Wind Gust','自然微风':'Ambient Wind','播放速度':'Playback Speed','正常速度':'Normal','半速观察':'Half Speed','四分之一速':'Quarter Speed','半速':'Half Speed','正常':'Normal','0.5× 慢速':'0.5× Slow','1.5× 快速':'1.5× Fast','斩击特效':'Slash Effects','命中提示':'Hit Effects','上一帧':'Previous Frame','下一帧':'Next Frame','原始待机对照':'Original Idle Reference','动作进度':'Animation Progress','受击进度 · 0.42 秒':'Hit Progress · 0.42 seconds','拖动检查动作':'Scrub Animation','受击':'Hit','暂停':'Pause','播放':'Play','载入中…':'Loading…','载入中':'Loading','载入角色…':'Loading character…','载入素材…':'Loading artwork…','已暂停':'Paused',
'代承坦克':'Guardian Tank','狂战坦克':'Berserker Tank','护盾坦克':'Shield Tank','单体输出':'Single-target DPS','单体射手':'Marksman','连击输出':'Combo DPS','群体输出':'Area DPS','异常输出':'Status DPS','召唤输出':'Summoner','治疗':'Healer','回能辅助':'Energy Support','进攻辅助':'Offensive Support','减伤控场':'Defensive Control','反击输出':'Counterattack DPS','风险辅助':'Risk Support',
'赫恩':'Heern','赤岳':'Chiyue','塞蕾':'Selei','凛':'Lin','隼':'Xun','绯雀':'Feique','维恩':'Weien','夜璃':'Yeli','诺克':'Nuoke','米拉':'Mila','伊莱':'Yilai','奏':'Zou','霜翎':'Shuangling','烬':'Jin','莉珀':'Lipo',
'待机 · 呼吸 / 眨眼 / 发梢 / 衣摆':'Idle · Breathing / Blinking / Hair / Cloth','单帧受击 · 后仰':'Hit Pose · Recoil','恢复待机':'Return to Idle','回到待机':'Return to Idle','原始待机':'Original Idle','待机':'Idle','呼吸 / 衣摆 / 刀尖':'Breathing / Cloth / Sword Tip','独立发梢 / 衣摆 · 物理待机':'Hair / Cloth · Idle Motion','命中 · 闪光':'Impact · Flash','受击 · 后仰':'Hit · Recoil','卸力':'Settle','回正':'Recover','闭眼':'Eyes Closed','单帧受击':'Hit Pose','命中':'Hits',
'抬手举剑':'Raise Sword','向下挥砍':'Downward Slash','顺势收力':'Follow Through','收剑 · 恢复待机':'Lower Sword · Return to Idle','蓄力':'Wind Up','举盾护头':'Raise Shield','屈膝 · 压低重心':'Bend Knees · Lower Stance','蹬地 · 前撞':'Push Off · Shield Bash','盾面接触命中':'Shield Impact','退回原位':'Return to Position','收盾 · 恢复待机':'Lower Shield · Return to Idle','双手抬枪':'Raise Both Pistols','前倾 · 瞄准':'Lean Forward · Aim','双枪交替射击':'Alternating Shots','收枪 · 恢复待机':'Lower Weapons · Return to Idle','动作帧':'Frame','双手托枪':'Support Rifle','抬枪贴肩':'Shoulder Rifle','开火后坐':'Fire & Recoil','重新稳定':'Steady Aim','放低枪口':'Lower Muzzle','收枪':'Lower Rifle','瞄准':'Aim','蹬地起跑':'Push Off','迈步接近':'Approach','踏步抬剑 · 右手':'Step & Raise Sword · Right Hand','转身随势 · 右手':'Turn & Follow Through · Right Hand','收剑稳定':'Settle Sword','攻击准备':'Ready','下压重心':'Lower Stance','拉弦过渡':'Draw Bow','瞄准蓄力':'Hold Aim','松弦射击':'Release Arrow','收手起身':'Recover & Rise','收势':'Recover',
'全部角色共用操作栏，可播放、暂停、慢放和拖动检查动作。':'Shared controls for every character: play, pause, slow down, or scrub the animation.',
'原地举剑下砍':'Stationary Downward Slash','右手奔袭下斩':'Running Sword Attack','抬盾压身撞击':'Shield Bash','双枪射击':'Dual-pistol Fire','举枪瞄准射击':'Aim & Fire','蹲身拉弓射击':'Crouching Bow Shot',
'沿用已确认的角色动作。':'Uses the approved character animations.',
'待机使用同一张身体底图与局部微动。受击仅用一张姿势，短促后仰、命中闪光与火花，然后恢复待机。':'Idle preserves the original artwork with subtle motion. A single hit pose recoils briefly with impact effects, then returns to idle.',
'本页为角色动作样片；普攻、战技和大招尚未制作。':'Character motion preview.',
'查看全部角色待机与受击 →':'Idle & Hit Reactions →','查看受击':'View Hit Reaction','选择攻击角色':'Choose an attacker',
'原始待机 · 尺寸与细节对照':'Original Idle · Scale & Detail Reference'
};
const ordered=Object.keys(phrases).sort((a,b)=>b.length-a.length);
const originalTitle=document.title;
let lang=localStorage.getItem('motion-language')==='en'?'en':'zh';
function t(s){if(lang!=='en')return s;let out='',at=0;while(at<s.length){const k=ordered.find(k=>s.startsWith(k,at));if(k){out+=phrases[k];at+=k.length;}else out+=s[at++];}return out;}
const originals=new WeakMap();let queued=false;
function refresh(){queued=false;if(!document.body)return;observer.disconnect();document.title=t(originalTitle);document.documentElement.lang=lang==='en'?'en':'zh-CN';
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=walker.nextNode()){if(n.parentElement.closest('script,style,[data-no-translate]'))continue;let rec=originals.get(n);if(!rec||n.nodeValue!==rec.last)rec={source:n.nodeValue,last:n.nodeValue};const value=t(rec.source);if(n.nodeValue!==value)n.nodeValue=value;rec.last=value;originals.set(n,rec);}
 document.querySelectorAll('[aria-label],[title]').forEach(el=>{for(const attr of ['aria-label','title']){if(!el.hasAttribute(attr))continue;const key='original'+attr.replace('-','');if(!el.dataset[key])el.dataset[key]=el.getAttribute(attr);el.setAttribute(attr,t(el.dataset[key]));}});
 document.querySelectorAll('[data-language]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.language===lang)));
 observer.observe(document.body,{childList:true,subtree:true,characterData:true});
}
const observer=new MutationObserver(()=>{if(!queued){queued=true;queueMicrotask(refresh);}});
function setLanguage(value){lang=value==='en'?'en':'zh';localStorage.setItem('motion-language',lang);refresh();document.querySelectorAll('iframe').forEach(f=>{try{f.contentWindow.SiteUI?.setLanguage(lang);}catch{}});window.dispatchEvent(new Event('languagechange'));}
window.SiteUI={t,setLanguage,get language(){return lang;},refresh};
if(window===window.top){const host=document.querySelector('.site-nav')||document.querySelector('header')||document.querySelector('main');const box=document.createElement('div');box.className='language-switch';box.setAttribute('data-no-translate','');box.innerHTML='<button type="button" data-language="zh">中文</button><button type="button" data-language="en">English</button>';box.onclick=e=>{if(e.target.dataset.language)setLanguage(e.target.dataset.language);};host?.append(box);}
window.addEventListener('storage',e=>{if(e.key==='motion-language'){lang=e.newValue==='en'?'en':'zh';refresh();window.dispatchEvent(new Event('languagechange'));}});
window.attachStudioFrame=(frame,hit=false)=>{const doc=frame.contentDocument;if(!doc||doc.URL==='about:blank')return;doc.documentElement.classList.add('embed');if(hit)doc.documentElement.classList.add('embed-hit');const root=new URL('.',document.querySelector('script[src*="site-ui.js"]').src);const css=doc.createElement('link');css.rel='stylesheet';css.onload=()=>{frame.style.visibility='visible';};css.href=new URL('site-ui.css',root);doc.head.append(css);const js=doc.createElement('script');js.src=new URL('site-ui.js',root);doc.body.append(js);};
refresh();window.dispatchEvent(new Event('languagechange'));
})();
