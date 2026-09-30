const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const core = require('../location-core');
let count = 0;
function test(name, fn) { fn(); count++; console.log('PASS ' + name); }
const now = Date.now();
const fix = (seconds = 0, meters = 0, accuracy = 5) => ({ latitude: 52 + meters / 111320, longitude: 5, accuracy, timestamp: now + seconds * 1000 });
test('reject inaccurate first fix', () => assert.equal(new core.Tracker().accept(fix(0,0,100), now).position, undefined));
test('reject invalid, stale and future positions', () => {
    for (const p of [{...fix(),latitude:NaN}, {...fix(),accuracy:0}, fix(-16), fix(3)]) assert.equal(new core.Tracker().accept(p, now).position, undefined);
});
test('stationary jitter stays stationary', () => {
    const t = new core.Tracker(); const a = t.accept(fix(), now).position;
    for (let i=1;i<15;i++) assert.equal(t.accept(fix(i, i%2 ? 1 : -1), now+i*1000).position.latitude,a.latitude);
});
test('walking is followed without unbounded lag', () => {
    const t = new core.Tracker();
    for(let i=0;i<30;i++) t.accept(fix(i,i*1.4), now+i*1000);
    assert.ok(core.meters(t.filtered,fix(29,29*1.4))<3);
});
test('single teleport rejected; consistent fixes recover', () => {
    const t=new core.Tracker();t.accept(fix(),now);
    assert.equal(t.accept(fix(1,100),now+1000).position,undefined);
    assert.equal(t.accept(fix(2,101),now+2000).position,undefined);
    assert.ok(t.accept(fix(3,100),now+3000).position);
});
test('recover after long background gap', () => {
    const t=new core.Tracker();t.accept(fix(),now);
    assert.ok(t.accept(fix(60,100),now+60000).position);
});
test('old and duplicate callbacks cannot move position', () => {
    const t=new core.Tracker();t.accept(fix(2),now+2000);
    assert.equal(t.accept(fix(1,10),now+2000).position,undefined);
    assert.equal(t.accept(fix(2,10),now+2000).position,undefined);
});
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const code=html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
const elements={};
function el(id) { return elements[id] ||= {textContent:'',value:'',innerHTML:'',className:'',width:755,height:553,events:{},addEventListener(k,fn){this.events[k]=fn},getBoundingClientRect(){return {width:755,height:553}},getContext(){return new Proxy({}, {get:()=>()=>{}})}}; }
let watches=[], cleared=[], intervals=[];
const env = {LocationCore:core, Date, Math, Number, console, setInterval(fn){intervals.push(fn)}, requestAnimationFrame(){},
    window:{isSecureContext:true,addEventListener(){}},
    navigator:{geolocation:{watchPosition(success,error,options){watches.push({success,error,options});return watches.length-1},clearWatch(id){cleared.push(id)}}},
    document:{visibilityState:'visible',getElementById:el,addEventListener(){}}};
vm.createContext(env); vm.runInContext(code,env);
const run=s=>vm.runInContext(s,env);
test('watch starts directly and retries after timeout',()=>{run('startGPS()');assert.equal(watches.length,1);watches[0].error({code:3});assert.equal(run('gpsRunning'),true);assert.equal(el('liveStatus').textContent,'Zoeken')});
test('stop invalidates callbacks including old successful callback',()=>{run('stopGPS()');watches[0].success({coords:fix(),timestamp:now});assert.equal(run('gpsPosition'),null);assert.ok(cleared.includes(0))});
test('old callback cannot change newly restarted session',()=>{run('startGPS()');watches[0].success({coords:fix(),timestamp:now});assert.equal(run('gpsPosition'),null);watches.at(-1).success({coords:fix(),timestamp:now});assert.ok(run('gpsPosition'))});
test('GPS movement updates marker without choosing or calibrating a start',()=>{
    run('stopGPS();startGPS()');
    watches.at(-1).success({coords:fix(-4),timestamp:now-4000});
    const a=run('({...targetGPSMapPoint})');
    watches.at(-1).success({coords:fix(-1,4),timestamp:now-1000});
    const b=run('({...targetGPSMapPoint})');
    assert.ok(b.y<a.y-20);assert.equal(b.x,a.x);
    run('animateGPS()');assert.ok(run('displayedGPSMapPoint.y')<a.y);
});
test('live route works and destination changes preserve GPS marker',()=>{
    el('roomSelect').value='4.01';el('routeButton').events.click();
    assert.equal(run('routeActive'),true);assert.ok(run('displayedGPSMapPoint'));
    el('roomSelect').events.change();assert.equal(run('routeActive'),false);assert.ok(run('displayedGPSMapPoint'));
});
test('coarse but usable fixes update approximate movement',()=>{
    const t=new core.Tracker();assert.ok(t.accept(fix(0,0,25),now).position);
    assert.ok(t.accept(fix(3,5,25),now+3000).position);
});
test('poor received measurement updates receipt time but not marker',()=>{
    run('stopGPS();startGPS()');
    watches.at(-1).success({coords:fix(-4),timestamp:now-4000});
    const a=run('targetGPSMapPoint.y');
    watches.at(-1).success({coords:fix(-1,100,100),timestamp:now-1000});
    assert.equal(run('targetGPSMapPoint.y'),a);
    assert.equal(el('lastUpdate').textContent,new Date(now-1000).toLocaleTimeString('nl-NL'));
});
test('permission denial clears watch and leaves restart possible',()=>{run('startGPS()');watches.at(-1).error({code:1});assert.equal(run('gpsRunning'),false);assert.equal(run('watchId'),null)});
test('silent watch recovers once and stop disables recovery',()=>{
    run('startGPS();lastReceivedAt=0;watchStartedAt=Date.now()-31000');
    const n=watches.length;intervals[0]();assert.equal(watches.length,n+1);
    intervals[0]();assert.equal(watches.length,n+1);
    run('stopGPS();watchStartedAt=0');intervals[0]();assert.equal(watches.length,n+1);
});
test('background does not restart the location watcher',()=>{
    run('startGPS();watchStartedAt=0;lastReceivedAt=0');env.document.visibilityState='hidden';
    const n=watches.length;intervals[0]();assert.equal(watches.length,n);
    env.document.visibilityState='visible';run('stopGPS()');
});
new vm.Script(fs.readFileSync(require('node:path').join(__dirname,'../sw.js'),'utf8'));
console.log(count+' tests passed; page and service worker parse successfully.');

