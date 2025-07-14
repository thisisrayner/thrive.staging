/**
 * File: /js/animations.js
 * 
 * Purpose: Handles all client-side logic for the hero section.
 * 
 * Description:
 * This script is responsible for the interactive and animated elements within the <section class="hero">.
 * It is loaded as a JavaScript module (`type="module"`) to allow for dynamic `import()` of its
 * dependencies, which are required for the SVG blob animations.
 * 
 * Key Functions:
 * 1.  Parallax Scroll: Adds a subtle parallax effect to the hero headline text on scroll.
 * 2.  Responsive Menu Logic: Manages the state of the hamburger menu for mobile/tablet views.
 * 3.  `initBubbles()`: Creates and animates the large, blurred bubble on the <canvas> element.
 * 4.  `initBlobs()`: Dynamically imports `spline.js` and `simplex-noise.js` to generate and 
 *     animate the four SVG blobs. Includes error handling in case the dependencies fail to load.
 *
 * Dependencies:
 * - /lib/spline.js (Dynamically imported)
 * - /lib/simplex-noise.js (Dynamically imported)
 */

// --- Parallax Scroll for Hero Text ---
const copy = document.querySelector('.hero__copy');
window.addEventListener('scroll', () => {
  const offset = window.scrollY;
  if (copy) {
    copy.style.transform = `translateY(${offset * 0.1}px)`;
  }
});

// --- Responsive Hamburger Menu Logic ---
const hamburgerButton = document.getElementById('hamburger-button');
const menuListContainer = document.getElementById('menu-list-container');

function openMenu() {
    hamburgerButton.setAttribute('aria-expanded', 'true');
    hamburgerButton.classList.add('active');
    menuListContainer.classList.add('active');
    document.documentElement.classList.add('menu-open');
}

function closeMenu() {
    hamburgerButton.setAttribute('aria-expanded', 'false');
    hamburgerButton.classList.remove('active');
    menuListContainer.classList.remove('active');
    document.documentElement.classList.remove('menu-open');
}

// FIX: Removed the check for the non-existent close button.
if (hamburgerButton && menuListContainer) {
  // Toggle menu with hamburger button
  hamburgerButton.addEventListener('click', () => {
    const isExpanded = hamburgerButton.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Auto-close menu when a navigation item is clicked
  menuListContainer.addEventListener('click', (event) => {
    if (event.target.tagName === 'A' && !event.target.classList.contains('info-icon-link')) {
      closeMenu();
    }
  });
}


/**
 * Initializes and animates the large background bubble on a canvas.
 */
function initBubbles() {
  const layer = document.getElementById('bubble-layer');
  if (!layer) return;

  const TWO_PI = Math.PI * 2;
  const rand = (a,b) => Math.random() * (b - a) + a;
  const pick = a => a[Math.floor(Math.random()*a.length)];
  const CENTRE_COLORS = ['#FE80E7','#7AD1E5','#FACE67'];
  // Geometric definition of the bubble shape
  const GEO = [
    {x:0,y:-0.95,r:0.80},{x:-0.95,y:0,r:0.85},{x:0.95,y:0,r:0.83},{x:-0.33,y:1.05,r:0.65},
    {x:0.33,y:1.05,r:0.65},{x:0,y:0.18,r:0.95},{x:-0.85,y:1.55,r:0.22},{x:-1.05,y:2.05,r:0.13}
  ];

  let mouseX = 0, mouseY = 0;
  let softX = 0, softY = 0;

  // Track mouse position for subtle parallax movement
  window.addEventListener('pointermove', e => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function createBubble({R,xPct,yPct,color,blur,zOrder,flipTail,parallax}) {
    const side = R * 6;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = side;
    canvas.className = 'bubble' + (blur ? ' blurred' : '');
    canvas.style.cssText = `width:${R*2}px; height:${R*2}px; left:calc(${xPct}% - ${R}px); top:calc(${yPct}% - ${R}px); z-index:${zOrder};`;
    
    const isDesktop = window.innerWidth > 860;
    canvas.style.pointerEvents = isDesktop ? 'auto' : 'none';
    
    const ctx = canvas.getContext('2d');
    const rot = rand(0,TWO_PI);
    const bobAmp = rand(R*0.04, R*0.07);
    const bobSpd = rand(0.002,0.004);
    const bobPha = Math.random()*TWO_PI;
    
    let bounce = 0, bounceV = 0;
    if (isDesktop) {
        canvas.addEventListener('pointerdown', ()=>{ bounceV = 0.5; });
    }

    const circles = GEO.map((p,i)=>({
      bx:p.x*(i>=6&&flipTail?-1:1)*R, by:p.y*R, br:p.r*R, orbit:rand(10,15),
      ampR:p.r*R*rand(i===5?0.90:0.35, i===5?1.00:0.5), spdPos:rand(0.006,0.01)*0.5,
      spdRad:(i===7?rand(0.006,0.01)*0.7:rand(0.006,0.01)*8), pha:Math.random()*TWO_PI
    }));

    function draw(t) {
      if (isDesktop) {
        bounce += bounceV;
        bounceV += -0.1*bounce;
        bounceV *= 0.92;
      } else {
        bounce = 0;
        bounceV = 0;
      }
      const scale = 1 + bounce*0.05;
      
      ctx.clearRect(0,0,side,side);
      ctx.fillStyle = color;
      ctx.beginPath();
      const dyB = Math.sin(t*bobSpd + bobPha)*bobAmp;
      
      circles.forEach(c=>{
        const ox = c.orbit*Math.cos(t*c.spdPos + c.pha);
        const oy = c.orbit*Math.sin(t*c.spdPos + c.pha);
        const r = c.br + c.ampR*Math.sin(t*c.spdRad + c.pha*1.4);
        const x = side/2 + Math.cos(rot)*(c.bx+ox) - Math.sin(rot)*(c.by+oy);
        const y = side/2 + Math.sin(rot)*(c.bx+ox) + Math.cos(rot)*(c.by+oy) + dyB;
        ctx.moveTo(x+r,y);
        ctx.arc(x,y,r,0,TWO_PI);
      });
      ctx.fill();

      const px = softX*parallax;
      const py = softY*parallax;
      canvas.style.transform = `translate3d(${px}px, ${py}px, 0) scale(${scale})`;
    }
    return {canvas,draw};
  }

  const bubbles=[];
  // Create only the large central bubble
  const center = createBubble({R:560,xPct:50,yPct:55,color:pick(CENTRE_COLORS),blur:false,zOrder:'2',flipTail:Math.random()>0.5,parallax:4});
  layer.appendChild(center.canvas);
  bubbles.push(center);
  
  let start=null;
  function tick(ts){
    if(!start) start=ts;
    const t=(ts-start)/1000;
    // Smoothly update mouse position for animation
    softX += (mouseX-softX)*0.04;
    softY += (mouseY-softY)*0.04;
    bubbles.forEach(b=>b.draw(t));
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/**
 * Initializes and animates the four SVG blobs using simplex noise.
 * Dynamically imports dependencies to avoid blocking page load.
 */
async function initBlobs() {
  const layer = document.getElementById('svg-blob-layer');
  if (!layer) return;

  try {
    // Dynamically import dependencies. This assumes they exist in /lib/
    const { spline } = await import('../lib/spline.js');
    const { default: SimplexNoise } = await import('../lib/simplex-noise.js');

    // --- Configuration Constants for Blob Generation ---
    const NUM_SVG_BLOBS = 4;
    const VIEWBOX = 200;
    const RADIUS = 75;
    const TRAVEL_RATIO = 0.075;
    const GLOBAL_STEP = 0.0012; // Controls animation speed
    const CENTER_BAND_W = 0.25; // % of screen width in center to avoid placing blobs
    const CLIP_MAX = 2; const CLIP_MIN = 0; // Number of blobs allowed to be clipped by screen edges
    const SIZE_MIN_VMIN = 0.50; const SIZE_MAX_VMIN = 0.75; // Blob size relative to viewport minimum
    const NUM_SEGMENTS = 8;
    const RADIUS_VARIANCE_FACTOR = 0.3;
    const MAX_ALLOWED_OVERLAP_PERCENT = 5;
    const MAX_INITIAL_PLACEMENT_ATTEMPTS = 150;

    const simplex = new SimplexNoise();
    const blobs=[];
    const rand=(a,b)=>Math.random()*(b-a)+a;
    const map=(n,a1,b1,a2,b2)=>((n-a1)/(b1-a1))*(b2-a2)+a2;
    
    function getIntersection(bb1,bb2){
      const x1=Math.max(bb1.left,bb2.left); const y1=Math.max(bb1.top,bb2.top);
      const x2=Math.min(bb1.left+bb1.width,bb2.left+bb2.width);
      const y2=Math.min(bb1.top+bb1.height,bb2.top+bb2.height);
      if(x2<x1||y2<y1) return 0;
      return (x2-x1)*(y2-y1);
    }
    
    function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

    let sides=['left','left','right','right'];
    sides=shuffle(sides);
    const clipCount=Math.floor(rand(CLIP_MIN,CLIP_MAX+1));
    const clipIndexes=shuffle(Array.from({length:NUM_SVG_BLOBS},(_,k)=>k)).slice(0,clipCount);

    function makePoints(){
      const pts=[];const stepAngle=(Math.PI*2)/NUM_SEGMENTS;
      for(let i=0;i<NUM_SEGMENTS;i++){
        const angle=i*stepAngle;
        const current=RADIUS+rand(-RADIUS*RADIUS_VARIANCE_FACTOR,RADIUS*RADIUS_VARIANCE_FACTOR);
        const x=VIEWBOX/2+Math.cos(angle)*current;
        const y=VIEWBOX/2+Math.sin(angle)*current;
        pts.push({x,y,ox:x,oy:y,nx:Math.random()*1000,ny:Math.random()*1000});
      }
      return pts;
    }

    function createBlob(side,clip){
      const vmin=Math.min(window.innerWidth,window.innerHeight);
      const travel=RADIUS*TRAVEL_RATIO;
      const bandLeft=window.innerWidth*0.5-window.innerWidth*(CENTER_BAND_W/2);
      const bandRight=window.innerWidth*0.5+window.innerWidth*(CENTER_BAND_W/2);
      let finalSize,finalLeft,finalTop,attempts=0,placed=false;
      
      // Attempt to place blobs without significant overlap
      while(attempts<MAX_INITIAL_PLACEMENT_ATTEMPTS){
        attempts++;
        const size=rand(vmin*SIZE_MIN_VMIN,vmin*SIZE_MAX_VMIN);
        const left=side==='left'
          ? clip ? rand(-size*0.3,-size*0.05) : rand(0,bandLeft-size)
          : clip ? rand(window.innerWidth-size*0.95,window.innerWidth-size*0.7) : rand(bandRight,window.innerWidth-size);
        const top=clip ? rand(-size*0.3,window.innerHeight-size*0.7) : rand(0,window.innerHeight-size);
        const bb={left,top,width:size,height:size};
        const area=bb.width*bb.height;
        if(area===0) continue;
        let valid=true;
        for(const existing of blobs){
          const existingBB=existing.bb;
          const existingArea=existingBB.width*existingBB.height;
          if(existingArea===0) continue;
          const inter=getIntersection(bb,existingBB);
          if(inter>0){
            const overlapCurrent=(inter/area)*100;
            const overlapExisting=(inter/existingArea)*100;
            if(overlapCurrent>MAX_ALLOWED_OVERLAP_PERCENT||overlapExisting>MAX_ALLOWED_OVERLAP_PERCENT){ valid=false;break; }
          }
        }
        if(valid){
          finalSize=size;
          finalLeft = left; 
          finalTop=top;
          placed=true;
          break;
        }
      }

      // Fallback if placement fails
      if(!placed){
        finalSize=rand(vmin*SIZE_MIN_VMIN,vmin*SIZE_MAX_VMIN);
        if(side==='left'){ finalLeft=clip?rand(-finalSize*0.3,-finalSize*0.05):rand(0,bandLeft-finalSize); }
        else{ finalLeft=clip?rand(window.innerWidth-finalSize*0.95,window.innerWidth-finalSize*0.7):rand(bandRight,window.innerWidth-finalSize); }
        finalTop=clip?rand(-finalSize*0.3,window.innerHeight-finalSize*0.7):rand(0,window.innerHeight-finalSize);
      }
      
      const svgNS='http://www.w3.org/2000/svg';
      const svg=document.createElementNS(svgNS,'svg');
      svg.classList.add('blob');
      svg.setAttribute('viewBox',`0 0 ${VIEWBOX} ${VIEWBOX}`);
      svg.style.cssText=`width:${finalSize}px;height:${finalSize}px;left:${finalLeft}px;top:${finalTop}px;position:absolute;pointer-events:auto;`;
      
      const path=document.createElementNS(svgNS,'path');
      path.style.cssText='fill:none;stroke:#fff;stroke-width:0.2;stroke-linejoin:round;stroke-linecap:round;';
      svg.appendChild(path);
      layer.appendChild(svg);
      
      const pts=makePoints();
      blobs.push({path,pts,travel,step:GLOBAL_STEP,bb:{left:finalLeft,top:finalTop,width:finalSize,height:finalSize}});
      
      // Speed up animation on hover
      path.addEventListener('mouseover',()=>{const b=blobs.find(x=>x.path===path);if(b) b.step=GLOBAL_STEP*2;});
      path.addEventListener('mouseleave',()=>{const b=blobs.find(x=>x.path===path);if(b) b.step=GLOBAL_STEP;});
    }

    // Create the specified number of blobs
    for(let i=0;i<NUM_SVG_BLOBS;i++){
      const side=sides[i]; const clip=clipIndexes.includes(i); createBlob(side,clip);
    }
    
    // Main animation loop for blobs
    function animate(){
      blobs.forEach(b=>{
        const {path,pts,travel,step}=b;
        path.setAttribute('d',spline(pts,1,true));
        pts.forEach(p=>{
          const nX=simplex.noise2D(p.nx,p.nx);
          const nY=simplex.noise2D(p.ny,p.ny);
          p.x=map(nX,-1,1,p.ox-travel,p.ox+travel);
          p.y=map(nY,-1,1,p.oy-travel,p.oy+travel);
          p.nx+=step; p.ny+=step;
        });
      });
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

  } catch (error) {
    // Log an error if the animation dependencies can't be found.
    console.error("Could not load blob animation dependencies. Make sure you have /lib/spline.js and /lib/simplex-noise.js", error);
  }
}

// --- Initialize All Animations ---
initBubbles();
initBlobs();