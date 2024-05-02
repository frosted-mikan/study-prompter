const promptsList = [
  {
    section: 'section 1', 
    prompts: [
      {
        prompt: "Text for section 1 prompt 1",
        time: 5,
        id: 's1p1',
      },
      {
        prompt: "Text for section 1 prompt 2",
        time: 6,
        id: 's1p2'
      }
    ]
  }, 
  {
    section: 'section 2', 
    prompts: [
      {
        prompt: "Text for section 2 prompt 1",
        time: 5,
        id: 's2p1',
      },
      {
        prompt: "Text for section 2 prompt 2",
        time: 6,
        id: 's2p2',
      }
    ]
  }, 
]

const allNotes = [];

function finishPrompts() {
  document.getElementById('innerPage').style.display = 'none';
  document.getElementById('finishPage').style.display = 'block';  

  // Display notes
  const tableData = allNotes.map(item => {
    return (
      `<tr>
        <td>${item.section}</td>
        <td>${item.prompt}</td>
        <td><div contenteditable>${item.note}</div></td>
      </tr>`
    );
  }).join('');

  const tableBody = document.querySelector("#tableBody");
  tableBody.innerHTML = tableData;
}

async function loopPrompts() {
  // Loop sections
  for (let i = 0; i < promptsList.length; i++) {
    // Set section title
    document.getElementById('sectionTitle').innerHTML = promptsList[i].section;

    // loop each prompt in section, render it
    for (let j = 0; j < promptsList[i].prompts.length; j++) {
      const item = promptsList[i].prompts[j];
      const promptRender = 
        `<div class="row">
          <div class="col-10">
            <h3 class="prompt">${item.prompt}</h3>
            <textarea
              id="notes-${item.id}"
              rows="5"
              placeholder="Enter notes here..."
            ></textarea>
          </div>
          <div class="col-2">
            <h3 id=${item.id} class="timer">${toMMSS(item.time)}</h3>
          </div>
        </div>`;
      let promptHolder = document.createElement('div');
      promptHolder.classList.add('promptCard');
      promptHolder.id = 'card-' + item.id;

      // add active class to first card
      if (j === 0) {
        promptHolder.classList.add('active');
      }

      promptHolder.innerHTML = promptRender;

      document.querySelector('#promptsContainer').appendChild(promptHolder);
    }

    for (let j = 0; j < promptsList[i].prompts.length; j++) {
      const item = promptsList[i].prompts[j];

      // display current promptCard as active
      const prevActive = document.getElementsByClassName('active')[0];
      prevActive.classList.remove('active');

      const promptCard = document.getElementById('card-' + item.id);
      promptCard.classList.add('active');

      // set timer per section
      const timeDisplay = document.getElementById(item.id);
      const promptNote = await startTimer(item.time, timeDisplay, item.id);

      allNotes.push({
        section: promptsList[i].section,
        prompt: item.prompt,
        note: promptNote,
      });
    }

    // Clear page for next section
    document.querySelector("#promptsContainer").innerHTML = '';
  }

  finishPrompts();
}

function toMMSS(timer) {
  var minutes = parseInt(timer / 60, 10);
  var seconds = parseInt(timer % 60, 10);

  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  return `${minutes}:${seconds}`;
}

function startTimer(duration, display, id) {
  return new Promise((resolve, reject) => {
    // Timer control
    var timer = duration;

    function timerFunc() {
      display.textContent = toMMSS(timer);
  
      timer--;
  
      if (timer < 0) {  
        clearInterval(interval);

        // When timer finishes, get notes and pass to resolve()
        const currNote = document.getElementById('notes-' + id) ? document.getElementById('notes-' + id).value : ''; 
        resolve(currNote);
      }
    }

    // Start timer automatically
    var interval = setInterval(timerFunc, 1000);

    // Play/pause time btn
    const playPauseBtn = document.getElementById('playpause');

    function playPauseBtnControl() {
      if (timer >= 0) {
        if (playPauseBtn.innerHTML.trim() === 'Pause') {
          playPauseBtn.innerHTML = 'Play';
          clearInterval(interval);
        } else {
          playPauseBtn.innerHTML = 'Pause';
          interval = setInterval(timerFunc, 1000);
        }
      }
    }

    playPauseBtn.addEventListener('click', function() {
      playPauseBtnControl();
    });

    document.addEventListener('keypress', function onEvent(event) {
      if (event.key === '1') {
        playPauseBtnControl();
      }
  });

    // When 'next' clicked, get notes and move on
    document.getElementById('next').addEventListener('click', function() {
      clearInterval(interval);

      const currNote = document.getElementById('notes-' + id) ? document.getElementById('notes-' + id).value : ''; 
      resolve(currNote);
    });
  });
}

// Quick and simple export target #table_id into a csv
function exportTable(table_id, separator = ',') {
  // Select rows from table_id
  var rows = document.querySelectorAll('table#' + table_id + ' tr');
  // Construct csv
  var csv = [];
  for (var i = 0; i < rows.length; i++) {
      var row = [], cols = rows[i].querySelectorAll('td, th');
      for (var j = 0; j < cols.length; j++) {
          // Clean innertext to remove multiple spaces and jumpline (break csv)
          var data = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, '').replace(/(\s\s)/gm, ' ')
          // Escape double-quote with double-double-quote
          data = data.replace(/"/g, '""');
          // Push escaped string
          row.push('"' + data + '"');
      }
      csv.push(row.join(separator));
  }
  var csv_string = csv.join('\n');
  // Download it
  var filename = 'export' + '_' + new Date().toLocaleDateString() + '.csv';
  var link = document.createElement('a');
  link.style.display = 'none';
  link.setAttribute('target', '_blank');
  link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv_string));
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
