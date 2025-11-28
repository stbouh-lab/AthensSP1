// survey.js – loads CSV → renders cards → exports .CHO
let currentSet = 0;
let design = [];
const responses = [];

// load design
fetch(https://raw.githubusercontent.com/stbouh-lab/AthensSP1/refs/heads/main/variant-a.csv)
  .then(r => r.text())
  .then(csv => {
    design = csvToArray(csv);
    renderSet(0);
  });

// CSV → array helper
function csvToArray(text) {
  const lines = text.trim().split('\n');
  const header = lines[0].split(',');
  return lines.slice(1).map(l => {
    const obj = {};
    l.split(',').forEach((val, i) => obj[header[i]] = val);
    return obj;
  });
}

// render one set
function renderSet(idx) {
  const set = design.filter(r => r.Set == idx + 1);
  let html = `<h3>Choice ${idx + 1} of 12</h3><div class="alternatives">`;
  set.forEach((alt, i) => {
    html += `
      <div class="alternative" onclick="selectAlt(${i})">
        <h4>Option ${String.fromCharCode(65 + i)}</h4>
        <div class="attribute"><strong>Method:</strong> ${['Home','Depot','Locker'][alt.Method]}</div>
        <div class="attribute"><strong>Cost:</strong> €${alt.DeliveryCost}</div>
        <div class="attribute"><strong>Time:</strong> ${['Same day','1 day','2 days','3 days','7 days','12 days','14 days'][alt.DeliveryTime]}</div>
        <div class="attribute"><strong>Walk:</strong> ${alt.WalkTime} min</div>
        <div class="attribute"><strong>Locker storage:</strong> ${alt.StorageDays} days</div>
        <div class="attribute"><strong>Window:</strong> ${['2-hour slot','5-hour slot','Open window'][alt.HomeWindow]}</div>
        <div class="attribute"><strong>Fullness:</strong> ${['Empty','Half full','Full'][alt.LockerFill]}</div>
        <div class="attribute"><strong>Accessibility:</strong> ${['None','Ramp','Flat','Low-height','Audio','Visual'][alt.Accessibility]}</div>
        <div class="attribute"><strong>Flexibility:</strong> ${['None','Day change','Extend free'][alt.Flexibility]}</div>
      </div>`;
  });
  html += '</div>';
  document.getElementById('choiceContainer').innerHTML = html;
  document.getElementById('currentQ').textContent = idx + 1;
  document.getElementById('progressBar').style.width = ((idx + 1) / 12 * 100) + '%';
}

// select alternative
function selectAlt(idx) {
  document.querySelectorAll('.alternative').forEach(el => el.classList.remove('selected'));
  document.querySelectorAll('.alternative')[idx].classList.add('selected');
  responses[currentSet] = idx;
  document.getElementById('nextBtn').disabled = false;
}

// navigation
function nextChoice() {
  if (currentSet < 11) {
    currentSet++;
    renderSet(currentSet);
  } else {
    exportCHO();
  }
}
function prevChoice() {
  if (currentSet > 0) {
    currentSet--;
    renderSet(currentSet);
  }
}

// export .CHO (Sawtooth format)
function exportCHO() {
  let cho = 'Version,Task,Concept,WhiteLabel,Method,DeliveryTime,DeliveryCost,StorageDays,WalkTime,HomeWindow,LockerFill,Accessibility,Flexibility,Response\n';
  responses.forEach((resp, t) => {
    const set = design.filter(r => r.Set == t + 1);
    set.forEach((alt, c) => {
      cho += `1,${t + 1},${c + 1},${alt.WhiteLabel},${alt.Method},${alt.DeliveryTime},${alt.DeliveryCost},${alt.StorageDays},${alt.WalkTime},${alt.HomeWindow},${alt.LockerFill},${alt.Accessibility},${alt.Flexibility},${resp == c ? 1 : 0}\n`;
    });
  });
  downloadFile('athens-choice.choo', cho);
  alert('Survey complete!  .CHO file downloaded.');
}

// download helper
function downloadFile(filename, text) {
  const blob = new Blob([text], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
}
