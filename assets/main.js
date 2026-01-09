const API_BASE_URL = "https://apiscore-qihw.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  if (page === "home") initHomePage();
  else if (page === "results") initResultsPage();
});

// Formate la date au format FR (JJ/MM/AAAA HHhMM)
function formatMatchDate(dateString) {
  if (!dateString) return "Date inconnue";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}h${minutes}`;
}

async function initHomePage() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/matches`);
    if (!response.ok) throw new Error("Erreur réseau");
    const matches = await matchesResponse(await response.json());
    
    // Séparer les matchs joués (score présent) et à venir
    const played = matches.filter(m => m.player1_score !== null).sort((a,b) => new Date(b.match_date) - new Date(a.match_date));
    const scheduled = matches.filter(m => m.player1_score === null).sort((a,b) => new Date(a.match_date) - new Date(b.match_date));

    updateHomeUI(scheduled[0], played[0]);
  } catch (error) {
    document.getElementById("error-message").textContent = "Erreur de chargement des données.";
  }
}

function updateHomeUI(next, last) {
  const nextDiv = document.getElementById("next-match");
  const lastDiv = document.getElementById("last-match");

  if (next) {
    nextDiv.innerHTML = `<p><strong>${next.player1}</strong> vs <strong>${next.player2}</strong><br>${formatMatchDate(next.match_date)}</p>`;
  }
  if (last) {
    lastDiv.innerHTML = `<p><strong>${last.player1} ${last.player1_score} - ${last.player2_score} ${last.player2}</strong><br>Vainqueur : ${last.winner}</p>`;
  }
}

async function initResultsPage() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/matches`);
    const matches = await response.json();
    const tbody = document.getElementById("matches-body");
    tbody.innerHTML = "";

    matches.forEach(m => {
      const tr = document.createElement("tr");
      const score = m.player1_score !== null ? `${m.player1_score} - ${m.player2_score}` : "À venir";
      tr.innerHTML = `<td>${formatMatchDate(m.match_date)}</td><td>${m.player1}</td><td>${m.player2}</td><td>${score}</td><td>${m.round_name}</td>`;
      tbody.appendChild(tr);
    });
  } catch (e) { console.error(e); }
}