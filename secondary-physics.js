// Fixed-length articulated strips with torsional elasticity and damping.
class SecondaryChain {
  constructor(points,{stiffness=28,damping=4,windGain=1,limit=.26}={}) {
    this.rest=points.map(p=>[...p]);this.nodes=points.map(p=>[...p]);
    this.stiffness=stiffness;this.damping=damping;this.windGain=windGain;this.limit=limit;
    this.links=points.slice(1).map((p,i)=>({length:Math.hypot(p[0]-points[i][0],p[1]-points[i][1]),rest:Math.atan2(p[0]-points[i][0],p[1]-points[i][1]),angle:0,velocity:0}));
    this.transforms=[];this.rebuild();
  }
  step(dt,wind=0){const old=this.links.map(l=>l.angle);
    this.links.forEach((l,i)=>{const f=(i+1)/this.links.length,parent=i?old[i-1]:0;
      // Elastic coupling propagates root motion downstream; heavier tips lag.
      const elastic=-this.stiffness*(1-.48*f)*(l.angle-parent*.66);
      const gravity=-3.5*Math.sin(l.angle);
      const acceleration=elastic+gravity-this.damping*l.velocity+wind*this.windGain*(.3+.7*f);
      l.velocity+=acceleration*dt;l.angle+=l.velocity*dt;
      if(Math.abs(l.angle)>this.limit){l.angle=Math.sign(l.angle)*this.limit;l.velocity*=.25;}
    });this.rebuild();
  }
  impulse(strength){this.links.forEach((l,i)=>{l.velocity+=strength*(i+1)/this.links.length;});}
  rebuild(){this.nodes[0]=[...this.rest[0]];
    this.links.forEach((l,i)=>{const a=l.rest+l.angle;this.nodes[i+1]=[this.nodes[i][0]+Math.sin(a)*l.length,this.nodes[i][1]+Math.cos(a)*l.length];const cs=Math.cos(l.angle),sn=Math.sin(l.angle);this.transforms[i]={cs,sn,x:this.nodes[i][0],y:this.nodes[i][1],rx:this.rest[i][0],ry:this.rest[i][1]};});
  }
  bind(x,y){let best={distance:Infinity,index:0};this.links.forEach((l,i)=>{const a=this.rest[i],b=this.rest[i+1],vx=b[0]-a[0],vy=b[1]-a[1],u=Math.max(0,Math.min(1,((x-a[0])*vx+(y-a[1])*vy)/(l.length*l.length))),d=(x-a[0]-u*vx)**2+(y-a[1]-u*vy)**2;if(d<best.distance)best={distance:d,index:i+u*.99999};});return best.index;}
  displacement(binding,x,y){const index=Math.floor(binding),u=binding-index,mix=u*u*(3-2*u),t=this.transforms[index],n=this.transforms[Math.min(index+1,this.transforms.length-1)],dx=x-t.rx,dy=y-t.ry,nx=x-n.rx,ny=y-n.ry;return [(t.x+t.cs*dx+t.sn*dy)*(1-mix)+(n.x+n.cs*nx+n.sn*ny)*mix-x,(t.y-t.sn*dx+t.cs*dy)*(1-mix)+(n.y-n.sn*nx+n.cs*ny)*mix-y];}
}
if(typeof module!=='undefined')module.exports={SecondaryChain};
