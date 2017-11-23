// check if browser and device is supported
var browser = getBrowserVersion()[0],
    version = parseFloat(getBrowserVersion()[1]);
if(mobileAndTabletcheck()){
  disable();
}else if(browser!="Chrome" && browser!="Firefox" && browser!="Safari" && browser!="Opera" && browser!="O"){
   disable();
}else{
  switch(browser){
    case "Chrome":
      if(version < 49.2) disable();
      break;
    case "Firefox":
      if(version < 55) disable();
      break;
    case "Opera":
      if(version < 47) disable();
      break;
    case "Safari":
      if(version < 10.1) disable();
      break;
    // case "Edge":
    //   if(version < 15) disable();
    //   break;
  }
}

function disable(){
    var el = document.getElementsByClassName("notSupported")[0];
  el.style.display = "block";
}

/*------------------*/
var width = window.innerWidth,
    height = window.innerHeight,
    pausing = true,
    filename,arrowsFly,
    arrowVals = [],
    
    // doms
    uploadUI = document.getElementsByClassName('uploadUI')[0],
    prepare = document.getElementsByClassName('prepare')[0],
    gameUI = document.getElementsByClassName('gameUI')[0],
    resultUI = document.getElementsByClassName('resultUI')[0],
    audioName = document.getElementById('audioName'),
    
    // canvas related data
    canvas,ctx,l,
    barNum = 100,
    barWidth = width/(barNum),
    barX = 0,
    barsOpacity = 0,
    
    // audio related data
    sound = document.getElementById('sound'),
    context,
    source,
    analyser,
    gainNode, 
    fbcArray,
    vals = ['',''],
    executed = false,
    scaleAniId,
    increasingScale = 0;

/*---handle uploaded audio---*/

function replay(){
  location.reload();
//   pausing = true;
  
//   // cancelAllAnimation();
//   restartThree();
//   clearInterval(arrowsFly);
//   arrowsFly = null;
//   // TODO stop music
//   sound.pause();
//   sound.currentTime = 0;
//   // clear bars
//   ctx.clearRect(0,0,width,height);
//     if (scaleAniId) {
//  window.cancelAnimationFrame(scaleAniId);
//    scaleAniId = undefined;
//   }
//   // clear upload
//   input.value = "";
//   initData();
//   var graduallyScale = setInterval(function(){
//       if(meshes[0].scale.x == 1){
//          clearInterval(graduallyScale);
//       }else{     meshes.forEach(function(mesh){ mesh.scale.set(increasingScale,increasingScale,increasingScale);
//         });
//         increasingScale += 0.5;
//       }
//     },100);
//   increasingScale = 0;
//   // clear arrows
//   var arrows = document.querySelectorAll(".arrow");
// [].forEach.call(arrows,function(arrow){   document.body.removeChild(arrow);
//   });
  
//  gameUI.classList.remove('show');
//  resultUI.classList.remove('resultEnter');
//   uploadUI.classList.add('show');
}

function initData(){
  //   init data
  arrows = {
      top:[],
      down:[],
      right:[],
      left:[]
    };
  scoreNum = 0;
  idNum = 0;
  finalResult = {
      score: 0, highestCombos: 0, level: ''};
    combosNum =0;
 increasingScale = 0;
  arrowVals = [];
  fbcArray = null;
    vals = ['',''];
    executed = false;
  barsOpacity = 0;
}

input.onchange = handleUpload;

function handleUpload(e){
  sound.src = URL.createObjectURL(this.files[0]);
  // sound.volume= 0;
  filename = this.files[0].name;
  initGame();

}

/*---game inition, handling audio context---*/
function initGame(){
  // fill song name
  audioName.innerHTML = filename;
  
  if(context == undefined){
     initAudio();
  }
  gainNode.gain.value = 2;
  
// actions to do when song ended
// used source.mediaElement in 1.0
  sound.addEventListener('ended',function(){
    pausing = true;
    
    clearInterval(arrowsFly);
    arrowsFly = null;
    arrowVals = [];
    // gradually set cubes to the original size
    var graduallyScale = setInterval(function(){
      if(meshes[0].scale.x == 1){
         clearInterval(graduallyScale);
      }else{     meshes.forEach(function(mesh){ mesh.scale.set(increasingScale,increasingScale,increasingScale);
        });
        increasingScale += 0.5;
      }
    },100);
    
    generateFinalResult();
    setTimeout(function(){
      showResult();
    },500);
})
  
  prepareGame(source);
  
}

function initAudio(){
  // init audioContext
  context = new AudioContext();
  // sound.disconnect(source);
    source = context.createMediaElementSource(sound);
  gainNode = context.createGain();
  analyser = context.createAnalyser();
  // connect
  source.connect(gainNode);
  gainNode.connect(analyser);
  analyser.connect(context.destination); 
}

/*---UI handling---*/
function prepareGame(source){
// transition

  uploadUI.classList.remove('show');
  prepare.classList.add('show');
  
 document.getElementsByClassName("go")[0].addEventListener("animationend",function(){
    play(source); prepare.classList.remove('show');
  });
  
}

function play(source){
  pausing = false;

// set timing to create arrows
  arrowsFly = setInterval(function(){
    if(arrowVals.length != 0 && pausing == false){
 createArrow(getAverage(arrowVals)>0.6);
      }
  },400);
  gameUI.classList.add("show");

  frameLooper();
  sound.play();
  // source.mediaElement.play();
  
}

function showResult(){
  URL.revokeObjectURL(sound.src);
  // transition
  gameUI.classList.remove('show');
  // setTimeout(function(){
  //   gameUI.style.display = 'none'; 
  // },1000);
  
// set final result- get dom
  var level = document.getElementsByClassName('level')[0],
      finalScore = document.getElementsByClassName('finalScore')[0],
      highestCombos = document.getElementsByClassName('highestCombos')[0];

// check full combo
  if(idNum == finalResult.highestCombos){
 resultUI.classList.add("fullCombo");
  }
  
// set final result- fill data
  finalScore.innerHTML = finalResult.score;
  highestCombos.innerHTML = finalResult.highestCombos;
  level.innerHTML = finalResult.level;
  
  
  
// transition- enter
  resultUI.classList.add('resultEnter');
}

/*---handle Pausing---*/
function adjustVolume(){
  pausing = true;
  // generate volume panel
  volume();
  analyser.disconnect(context.destination);   
}

function pauseGame(){
  pause();
  // generate pause panel
  pausing = true;  analyser.disconnect(context.destination);   
}

/*------frameLooper------*/
function frameLooper(){
  if(!pausing){
    if (scaleAniId) {
 window.cancelAnimationFrame(scaleAniId);
   scaleAniId = undefined;
    
  }
  scaleAniId = window.requestAnimationFrame(frameLooper);
  var fbcArray = new Uint8Array(analyser.frequencyBinCount);

analyser.getByteFrequencyData(fbcArray);
    // checkRemove();

 //  createArrow(
 // variance(fbcArray)>8000
 //  );
    
// make the cubes to scale to the music
    var scaleVal = getVals(fbcArray)/3;
    scale(scaleVal);

// handle data for timings of creating arrows
   arrowVals.push(scaleVal);
    
    if(arrowVals.length >= 24){
       arrowVals = [];
    }

  drawBars(fbcArray);

  }else{
        if (scaleAniId) {
 window.cancelAnimationFrame(scaleAniId);
   scaleAniId = undefined;
  }
    scaleAniId = window.requestAnimationFrame(frameLooper)
  }
}

/*-------canvas-------*/
canvas = document.createElement('canvas');
ctx = canvas.getContext('2d');
canvas.className = "bars";

canvas.width= width;
canvas.height= height;
document.body.appendChild(canvas);


//draw bars
function drawBars(fbcArray){
  if(!pausing){  ctx.clearRect(0,0,width,height);
  ctx.fillStyle = 'rgba(255,255,255,'+ barsOpacity +')';

if(barsOpacity < 0.5){
   barsOpacity += 0.003;
}
               for(l=0;l<barNum;l+=1){
  var Barheight = -(fbcArray[l]/2.5);
  ctx.fillRect(
    barX+(l*barWidth),
    canvas.height,
    barWidth,
    Barheight);
 ctx.fill();
  
  ctx.fillRect(
    window.innerWidth-((l+1)*barWidth),
    0,
    barWidth,
    -Barheight);
 ctx.fill();
  }
}
  }

/*--Decide when to create arrows--*/
function getAverage(arr){
var sum = 0,result;
arr.forEach(function(arr){
sum+=arr;
});
  result = sum/arr.length;
return result;
}

function getVals(fbcArray){
  var ave = getAverage(fbcArray);
  
  if(executed == false){
    vals[0] = ave;
    executed = true;
    return;
  }else{
    vals[1]=ave;
    var differance;
  }
  differance = Math.abs(vals[0]-vals[1]);
  vals[0] = vals[1];
  delete vals[1];
  return differance;
}

function getNums(arr){
  var nums = {
    highest: 0, lowest: ''
  };
  arr.forEach(function(arr){
    if(arr>nums.highest){
      nums.highest = arr;
    }else if(!nums.lowest){
      nums.lowest = arr;
    }else if(arr<nums.lowest){
      nums.lowest = arr;
    }
  });
  return nums;
}

function variance(arr){
  var len = 0;var sum=0;
  for(var i=0;i<arr.length;i++){
    if (arr[i] == ""){
  }else if (typeof(arr[i]) != 'number'){
    alert(arr[i] + " is not number, Variance Calculation failed!");
    return 0;}
  else{
    len = len + 1;
    sum = sum + parseFloat(arr[i]);
    }
  }
  var v = 0;
  if (len > 1){
    var mean = sum / len;
  for(var i=0;i<arr.length;i++){if (arr[i] == ""){
  }else{
    v = v + (arr[i] - mean) * (arr[i] - mean);
  }
}
  return v / len;
  }else{
  return 0;
  }
}

/*---handle resize----*/
window.addEventListener('resize', onResize);

function onResize() {
  width = window.innerWidth;
  height = window.innerHeight;
 
  canvas.width= width;
  canvas.height= height;
  barWidth = width/(barNum);
  ctx.clearRect(0,0,width,height);
  l = 0;
  
  renderer.setSize(width, height);
  center = {x: document.body.clientWidth/2, y:document.body.clientHeight/2};
}

function transition(dom,phase){
  if(phase == 'enter'){
     
     }else if(phase == 'leave'){
    
  }
}

function handleClass(dom,className1,className2){
  dom.classList.remove(className1);
  dom.classList.remove(className2);
}

function cancelAllAnimation(){
  window.cancelRequestAnimFrame = ( function() {
    return window.cancelAnimationFrame          ||
        window.webkitCancelRequestAnimationFrame    ||
        window.mozCancelRequestAnimationFrame       ||
        window.oCancelRequestAnimationFrame     ||
        window.msCancelRequestAnimationFrame        ||
        clearTimeout
} )();

for (var i = 1; i < 99999; i++) {
  window.clearInterval(i);
  window.cancelRequestAnimFrame(i);
}
}