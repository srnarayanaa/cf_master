let problems = [];
let solvedSet = new Set();

async function loadProblems() {
  const sheetUrl = "PASTE_YOUR_GOOGLE_SHEETS_CSV_LINK_HERE";
  const res = await fetch(sheetUrl);
  const text = await res.text();
  problems = text.split("\n").slice(1).map(line => {
    const [sno, name, link, tag, rating] = line.split(",");
    return { sno, name, link, tag, rating: Number(rating) };
  });
}

async function loadSolved(handle) {
  const url = `https://codeforces.com/api/user.status?handle=${handle}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== "OK") return alert("Invalid handle");
  solvedSet = new Set(
    data.result.map(r => `${r.problem.contestId}${r.problem.index}`)
  );
  renderProblems();
}

function renderProblems(list = problems) {
  const div = document.getElementById("problemsList");
  div.innerHTML = "";
  list.forEach(p => {
    const a = document.createElement("a");
    a.href = p.link;
    a.textContent = `${p.name} (${p.rating})`;
    a.target = "_blank";
    const box = document.createElement("div");
    box.className = "problem";
    if (isSolved(p.link)) box.classList.add("solved");
    box.appendChild(a);
    div.appendChild(box);
  });
}

function isSolved(link) {
  const parts = link.match(/\/contest\/(\d+)\/problem\/([A-Z]\d?)/);
  if (!parts) return false;
  return solvedSet.has(`${parts[1]}${parts[2]}`);
}

function showRandom() {
  const randomList = [...problems].sort(() => Math.random() - 0.5).slice(0, 20);
  renderProblems(randomList);
}

function showByRating() {
  renderProblems([...problems].sort((a, b) => a.rating - b.rating));
}

function showByTopic() {
  const grouped = {};
  problems.forEach(p => {
    if (!grouped[p.tag]) grouped[p.tag] = [];
    grouped[p.tag].push(p);
  });
  const div = document.getElementById("problemsList");
  div.innerHTML = "";
  for (const tag in grouped) {
    const h = document.createElement("h3");
    h.textContent = tag;
    div.appendChild(h);
    grouped[tag].forEach(p => {
      const a = document.createElement("a");
      a.href = p.link;
      a.textContent = `${p.name} (${p.rating})`;
      a.target = "_blank";
      const box = document.createElement("div");
      box.className = "problem";
      if (isSolved(p.link)) box.classList.add("solved");
      box.appendChild(a);
      div.appendChild(box);
    });
  }
}

document.getElementById("loadBtn").onclick = async () => {
  await loadProblems();
  const handle = document.getElementById("handleInput").value;
  if (handle) await loadSolved(handle);
};
