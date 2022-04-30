import clock from "clock";
import * as document from "document";
import { preferences } from "user-settings";
import * as util from "../common/utils";
import { battery } from "power";
import { HeartRateSensor } from "heart-rate";
import { today } from "user-activity";

import { BodyPresenceSensor } from "body-presence";
import { user } from "user-profile";


var x = true;

var hrmStr = "--"
var onWrist = true;

// The following block read the heart rate from your watch
const hrm = new HeartRateSensor();
const hrmHandle = document.getElementById('hrm');
const stepHandle = document.getElementById('steps');

const mainHandle = document.getElementById('main');

hrm.onreading = function() {
  if(onWrist){
    hrmStr = "" + hrm.heartRate;
  }
  else {
    hrmStr = "--";
  }
}
hrm.start();

if (BodyPresenceSensor) {
   console.log("This device has a BodyPresenceSensor!");
   const bodyPresence = new BodyPresenceSensor();
   bodyPresence.addEventListener("reading", () => {
     onWrist = bodyPresence.present;
     if(!onWrist){
       hrmStr = "--";
     }
   });
   bodyPresence.start();
} else {
   console.log("This device does NOT have a BodyPresenceSensor!");
}


function hMirror(parent, ref, target)
{
  let w = parent.getBBox().width;
  let offs = ref.getBBox().x;
  target.x = w - offs - target.getBBox().width;
}


const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Update the clock every minute
clock.granularity = "seconds";

// Get a handle on the <text> element
const myLabel = document.getElementById("myLabel");
const dateHandle = document.getElementById("dateText");
const secLabel = document.getElementById("secs");
const apLabel = document.getElementById("ampm");



//const myLabelS = document.getElementById("myLabelS");

// Update the <text> element every tick with the current time
const ticker = (evt) => {
  if(evt){
    let todayDate = evt.date;
    let hours = todayDate.getHours();
    if (preferences.clockDisplay === "12h") {
      // 12h format
      apLabel.text = (todayDate.getHours() < 12) ? " AM": " PM";
      
      hours = hours % 12 || 12;
    } else {
      // 24h format
      hours = util.zeroPad(hours);
      apLabel.text = "   "
    }
    let mins = util.zeroPad(todayDate.getMinutes());
    let secs = util.zeroPad(todayDate.getSeconds());
    myLabel.text = `${hours}:${mins}`;//`:${secs}`;
    dateHandle.text = `${days[todayDate.getDay()].substring(0,3)}, ${months[todayDate.getMonth()]} ${todayDate.getDate()}`;//, ${todayDate.getYear()+1900}`;
    secLabel.text = `:${secs}`;

  }
  
  let slbb = secLabel.getBBox();
  let tlbb = myLabel.getBBox();
  let albb = apLabel.getBBox();
  
  let mw = Math.max(slbb.width, albb.width);
  
  
  let gap = 0;
  myLabel.x = 168 - mw/2 - gap/2;
  
  hMirror(mainHandle, myLabel, secLabel);
  hMirror(mainHandle, myLabel, apLabel);
  
  


  if (preferences.clockDisplay === "12h"){
    secLabel.y = 168;
  }
  else {
    secLabel.y = 168 + slbb.height/2;
  }
  apLabel.y = secLabel.y + slbb.height;
  

  let myBattery = document.getElementById("bat");


  let batPct = Math.floor(battery.chargeLevel);
  myBattery.text= (batPct + "%");//" &#x2665;");
  //myBattery.y = 2*(168-da.y)+168 -myBattery.getBBox().height;

  let half=50;
  let r = Math.floor((batPct < half) ? 255 : ((100 - batPct)/50 * 255));
  let g = Math.floor((batPct < half) ? (batPct/half*255) : 255);
  myBattery.style.fill = `#${util.lpad(r.toString(16), 0, 2)}${util.lpad(g.toString(16), 0, 2)}00`

  stepHandle.text = `&#x1F45F; ${today.adjusted.steps}`;
  hrmHandle.text = `&#x2665; ${hrmStr} / ${user.restingHeartRate}`; 

  const azmHandle = document.getElementById("azm");
  azmHandle.text = `&#x23F1; ${today.adjusted.activeZoneMinutes.total}`

  const calsHandle = document.getElementById("cals");
  calsHandle.text = `&#128293; ${today.adjusted.calories}`


  for(const e of document.getElementsByClassName('toggles')){
    e.style.display = x ? 'inline' : 'none'
    // e.setAttribute('fill-opacity', x? 1 : 0);
  }
  

  function yb(h)
  {
    const yy = document.getElementById("yy");
    yy.y = h.getBBox().y;
    yy.x = h.getBBox().x;
    yy.width = h.getBBox().width;
    yy.height = h.getBBox().height;
  }

}

clock.ontick = ticker;
myLabel.onclick = (e) => {
  x = !x;
  console.log(x);
  ticker();
}
