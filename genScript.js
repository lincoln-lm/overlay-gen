document.addEventListener('DOMContentLoaded', function () {
  const inputs = document.querySelectorAll('input');
  inputs.forEach((input) => {
    if (input.type === 'color') {
      input.addEventListener('input', function () { generateImage(); });
    } else if (input.type === 'range') {
      input.addEventListener('input', function (e) {
        const numberInput = document.getElementById(e.target.id + 'Number');
        if (numberInput) { numberInput.value = e.target.value; updateSliderBackground(e.target); }
        generateImage();
      });
    } else if (input.type === 'number' && input.id.endsWith('Number')) {
      input.addEventListener('input', function (e) {
        const sliderId = e.target.id.replace('Number','');
        const slider = document.getElementById(sliderId);
        if (slider) {
          let value = parseInt(e.target.value, 10) || slider.min;
          value = Math.min(Math.max(value, slider.min), slider.max);
          e.target.value = value;
          slider.value = value;
          updateSliderBackground(slider);
        }
        generateImage();
      });
    } else { input.addEventListener('input', handleTextInput); }
  });
  document.querySelectorAll('input[type="range"]').forEach(updateSliderBackground);
  const fontSelectEl = document.getElementById('fontStyle');
  if (fontSelectEl) fontSelectEl.addEventListener('change', generateImage);
  const c1Text = document.getElementById('colour1Text');
  const c2Text = document.getElementById('colour2Text');
  const cTextText = document.getElementById('colourTextText');
  const c1 = document.getElementById('colour1');
  const c2 = document.getElementById('colour2');
  const ct = document.getElementById('colourText');
  if (c1Text && c1) c1Text.value = c1.value;
  if (c2Text && c2) c2Text.value = c2.value;
  if (cTextText && ct) cTextText.value = ct.value;
  generateImage();
});

function updateSliderBackground(slider) {
  const value = ((slider.value - slider.min)/(slider.max - slider.min))*100;
  slider.style.backgroundSize = value + '% 100%';
}

function handleTextInput(e) {
  const inputId = e.target.id;
  if (inputId && inputId.endsWith('Text')) {
    const colorPickerId = inputId.replace('Text','');
    const colorPicker = document.getElementById(colorPickerId);
    const hexColor = e.target.value;
    if (/^#[0-9A-Fa-f]{6}$/.test(hexColor) && colorPicker) { colorPicker.value = hexColor; generateImage(); }
  } else { generateImage(); }
}

function getFontStyle() {
  const fontSelect = document.getElementById('fontStyle');
  if (!fontSelect) { return { family:'Consolas', weight:'400', style:'normal' }; }
  const [fontFamily, weightStyle] = fontSelect.value.split('-');
  let weight = '400';
  let style = 'normal';
  if (weightStyle && weightStyle.endsWith('i')) { weight = weightStyle.slice(0,-1); style='italic'; }
  else if (weightStyle) weight = weightStyle;
  return { family: fontFamily, weight: weight, style: style };
}

function generateImage() {
  var canvasWidth = parseInt(document.getElementById('canvasWidth').value,10);
  var canvasHeight = parseInt(document.getElementById('canvasHeight').value,10);
  var pixels = parseInt(document.getElementById('pixelCount').value,10);
  var color1 = (document.getElementById('colour1')||{}).value || '#ffb0c5';
  var color2 = (document.getElementById('colour2')||{}).value || '#99cdf0';
  var colorText = (document.getElementById('colourText')||{}).value || 'black';
  var opacity = parseInt((document.getElementById('opacity')||{}).value,10) || 100;
  const fontStyle = getFontStyle();
  const c1Text = document.getElementById('colour1Text');
  const c2Text = document.getElementById('colour2Text');
  const cTextText = document.getElementById('colourTextText');
  if (c1Text) c1Text.value = color1.toUpperCase();
  if (c2Text) c2Text.value = color2.toUpperCase();
  if (cTextText) cTextText.value = colorText.toUpperCase();
  var canvas = document.getElementById('canvas');
  if (!canvas) return;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  var ctx = canvas.getContext('2d');
  if (canvasWidth<=0||canvasHeight<=0) return;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.globalAlpha = 0;
  ctx.fillStyle='white';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.globalAlpha = opacity/100;
  const pixelWidth = canvasWidth/60;
  const pixelHeight = canvasHeight/12;
  const pixelY = canvasHeight/2 - pixelHeight/2;
  const textSizePercent = (parseInt((document.getElementById('textSize')||{}).value,10)||100)/100;
  let desiredFontSize = Math.min(pixelHeight*textSizePercent,pixelHeight);
  function setFont(size){ ctx.font=`${fontStyle.style} ${fontStyle.weight} ${size}px "${fontStyle.family}"`; }
  const sampleText = Math.max(Math.abs(pixels),1).toString();
  setFont(desiredFontSize);
  let textWidth = ctx.measureText(sampleText).width;
  const maxAllowedWidth = Math.max(pixelWidth-10,6);
  while(textWidth>maxAllowedWidth && desiredFontSize>1){ desiredFontSize-=1; setFont(desiredFontSize); textWidth=ctx.measureText(sampleText).width; }
  const fontSize = Math.max(1,Math.floor(desiredFontSize));
  setFont(fontSize);
  for(let i=-pixels;i<pixels;i++){
    var pixelX=canvasWidth/2+i*pixelWidth;
    ctx.fillStyle=color1;
    if(Math.abs(i%2)===1) ctx.fillStyle=color2;
    ctx.fillRect(pixelX,pixelY,pixelWidth,pixelHeight);
    var num=i<0?Math.abs(i):i+1;
    setFont(fontSize);
    ctx.fillStyle=colorText;
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.fillText(num,pixelX+pixelWidth/2,pixelY+pixelHeight/2);
    ctx.globalAlpha=opacity/100;
  }
  ctx.globalAlpha=1;
  var crosshairWidth=0.003125*canvasWidth;
  var crosshairHeight=canvasHeight;
  var crosshairX=canvasWidth/2 - crosshairWidth;
  var crosshairY=0;
  ctx.fillStyle='#e8e8e8';
  ctx.fillRect(crosshairX,crosshairY,crosshairWidth,crosshairHeight);
  const dl = document.getElementById('downloadBtn');
  if(dl) dl.disabled=false;
}

function downloadImage() {
  var canvas=document.getElementById('canvas');
  if(!canvas) return;
  var link=document.createElement('a');
  link.href=canvas.toDataURL();
  link.download='overlay.png';
  link.click();
}
