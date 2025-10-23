let problems = [];
let solvedSet = new Set();

async function loadProblems() {
  const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR1RbzSSrpsrBuAadVRSM-jzL7une4RuTurzkmdtjjtg-2JHW-PyLxhKyZy6EpqAYTVWjyMbTxrceEO/pub?output=csv";
  try {
    const res = await fetch(sheetUrl);
    const text = await res.text();

    // Parse CSV
    problems = text
      .split("\n")
      .slice(1)
      .map(line => line.trim())
      .filter(line => line.length)
      .map(line => {
        const [sno, name, link, tag, rating] = line.split(",");
        return {
          sno: sno?.trim(),
          name: name?.trim(),
          link: link?.trim(),
          tag: tag?.trim(),
          rating: Number(rating?.trim())
        };
      });

    renderProblems();
  } catch (err) {
    console.error("Error loading CSV:", err);
    document.getElementById("problemsList").innerHTML = "<p>⚠️ Failed to load problems.</p>";
  }
}

async function loadSolved(handle) {
  const url = `https://codeforces.com/api/user.status?handle=${handle}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== "OK") return alert("Invalid handle");
  solvedSet = new Set(data.result.map(r => `${r.problem.contestId}${r.problem.index}`));
  renderProblems();
}

function renderProblems(list = problems) {
  const div = document.getElementById("problemsList");
  div.innerHTML = "";
  if (!list.length) {
    div.innerHTML = "<p>No problems found.</p>";
    return;
  }

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

// ✅ Auto-load problems when site opens
window.onload = loadProblems;

// ✅ Load solved ones when button clicked
document.getElementById("loadBtn").onclick = async () => {
  const handle = document.getElementById("handleInput").value;
  if (!problems.length) await loadProblems();
  if (handle) await loadSolved(handle);
};
