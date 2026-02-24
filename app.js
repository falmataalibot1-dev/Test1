const form = document.getElementById('assignment-form');
const list = document.getElementById('grade-list');
const weightedGradeEl = document.getElementById('weighted-grade');
const letterGradeEl = document.getElementById('letter-grade');
const totalWeightEl = document.getElementById('total-weight');
const warningEl = document.getElementById('weight-warning');
const clearBtn = document.getElementById('clear-btn');

/** @type {{id:number,subject:string,assignment:string,score:number,weight:number}[]} */
let grades = [];

function letterFromScore(score) {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 67) return 'D+';
  if (score >= 63) return 'D';
  if (score >= 60) return 'D-';
  return 'F';
}

function formatPercent(value) {
  return `${value.toFixed(2)}%`;
}

function updateSummary() {
  if (grades.length === 0) {
    weightedGradeEl.textContent = '0.00%';
    letterGradeEl.textContent = 'N/A';
    totalWeightEl.textContent = '0.00%';
    warningEl.textContent = '';
    return;
  }

  const totalWeight = grades.reduce((sum, item) => sum + item.weight, 0);
  const weightedPoints = grades.reduce((sum, item) => sum + (item.score * item.weight) / 100, 0);
  const normalizedScore = totalWeight > 0 ? (weightedPoints / totalWeight) * 100 : 0;

  weightedGradeEl.textContent = formatPercent(normalizedScore);
  letterGradeEl.textContent = letterFromScore(normalizedScore);
  totalWeightEl.textContent = formatPercent(totalWeight);

  if (totalWeight < 100) {
    warningEl.textContent = `Add ${formatPercent(100 - totalWeight)} more weight to reach 100%.`;
  } else if (totalWeight > 100) {
    warningEl.textContent = `You are over by ${formatPercent(totalWeight - 100)}. Consider adjusting weights.`;
  } else {
    warningEl.textContent = 'Perfect weighting: total equals 100%.';
  }
}

function renderRows() {
  if (grades.length === 0) {
    list.innerHTML = `
      <tr class="empty-row">
        <td colspan="6">No grades added yet.</td>
      </tr>
    `;
    updateSummary();
    return;
  }

  list.innerHTML = grades
    .map((item) => {
      const contribution = (item.score * item.weight) / 100;
      return `
        <tr>
          <td>${item.subject}</td>
          <td>${item.assignment}</td>
          <td>${formatPercent(item.score)}</td>
          <td>${formatPercent(item.weight)}</td>
          <td>${formatPercent(contribution)}</td>
          <td>
            <button class="danger-btn" data-remove-id="${item.id}" type="button">Remove</button>
          </td>
        </tr>
      `;
    })
    .join('');

  updateSummary();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const subject = String(formData.get('subject') || '').trim();
  const assignment = String(formData.get('assignment') || '').trim();
  const score = Number(formData.get('score'));
  const weight = Number(formData.get('weight'));

  if (!subject || !assignment || Number.isNaN(score) || Number.isNaN(weight)) {
    return;
  }

  if (score < 0 || score > 100 || weight <= 0 || weight > 100) {
    warningEl.textContent = 'Please enter a score from 0-100 and a weight from 0.01-100.';
    return;
  }

  grades.push({
    id: Date.now() + Math.floor(Math.random() * 10000),
    subject,
    assignment,
    score,
    weight,
  });

  form.reset();
  renderRows();
});

list.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const id = target.getAttribute('data-remove-id');
  if (!id) return;

  grades = grades.filter((item) => String(item.id) !== id);
  renderRows();
});

clearBtn.addEventListener('click', () => {
  grades = [];
  renderRows();
});

renderRows();
