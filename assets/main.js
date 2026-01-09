// ⚠️ À ADAPTER avec l’URL de TON API Render
const API_BASE_URL = "https://apiscore-votreprenom.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;

  if (page === "home") {
    initHomePage();
  } else if (page === "results") {
    initResultsPage();
  }
});

// -------------------------
// GESTION DES ERREURS
// -------------------------
function showError(message) {
  const errorDiv = document.getElementById("error-message");
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.classList.add("error");
  } else {
    alert(message);
  }
}

// -------------------------
// UTILITAIRES
// -------------------------
function formatMatchDate(dateString) {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}h${minutes}`;
}

function getMatchStatus(match) {
  const now = new Date();
  const matchDate = new Date(match.match_date);

  if (
    match.player1_score != null &&
    match.player2_score != null &&
    matchDate <= now
  ) {
    return "played";
  }
  return "scheduled";
}

// =========================
// PAGE D’ACCUEIL
// =========================
async function initHomePage() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/matches`);
    if (!response.ok) {
      throw new Error(`Erreur API (${response.status})`);
    }

    const matches = await response.json();
    const now = new Date();

    matches.forEach((m) => {
      m.status = getMatchStatus(m);
    });

    const played = matches.filter(
      (m) => m.status === "played" && new Date(m.match_date) <= now
    );

    const scheduled = matches.filter(
      (m) => m.status === "scheduled" && new Date(m.match_date) >= now
    );

    let lastMatch = null;
    if (played.length > 0) {
      played.sort((a, b) => new Date(a.match_date) - new Date(b.match_date));
      lastMatch = played[played.length - 1];
    }

    let nextMatch = null;
    if (scheduled.length > 0) {
      scheduled.sort((a, b) => new Date(a.match_date) - new Date(b.match_date));
      nextMatch = scheduled[0];
    }

    updateHomePage(nextMatch, lastMatch);

  } catch (error) {
    console.error(error);
    showError("Impossible de charger les données (API ou réseau indisponible).");
  }
}

function updateHomePage(nextMatch, lastMatch) {
  const nextDiv = document.getElementById("next-match");
  const lastDiv = document.getElementById("last-match");

  // Prochain match
  if (nextMatch) {
    nextDiv.innerHTML = `
      <p><strong>${nextMatch.player1}</strong> vs <strong>${nextMatch.player2}</strong></p>
      <p>Date : ${formatMatchDate(nextMatch.match_date)}</p>
      <p>Tour : ${nextMatch.round_name}</p>
      <p>Statut : <span class="status-${nextMatch.status}">${nextMatch.status}</span></p>
    `;
  } else {
    nextDiv.innerHTML = "<p>Aucun match à venir trouvé.</p>";
  }

  // Dernier match
  if (lastMatch) {
    const score =
      lastMatch.player1_score != null && lastMatch.player2_score != null
        ? `${lastMatch.player1_score} - ${lastMatch.player2_score}`
        : "Score non renseigné";

    lastDiv.innerHTML = `
      <p><strong>${lastMatch.player1}</strong> vs <strong>${lastMatch.player2}</strong></p>
      <p>Date : ${formatMatchDate(lastMatch.match_date)}</p>
      <p>Score : ${score}</p>
      <p>Vainqueur : ${lastMatch.winner}</p>
      <p>Statut : <span class="status-${lastMatch.status}">${lastMatch.status}</span></p>
    `;
  } else {
    lastDiv.innerHTML = "<p>Aucun match joué trouvé.</p>";
  }
}

// =========================
// PAGE RÉSULTATS
// =========================
async function initResultsPage() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/matches`);
    if (!response.ok) {
      throw new Error(`Erreur API (${response.status})`);
    }

    const matches = await response.json();
    renderMatchesTable(matches);

  } catch (error) {
    console.error(error);
    showError("Impossible de charger la liste des matchs.");
  }
}

function renderMatchesTable(matches) {
  const tbody = document.getElementById("matches-body");
  tbody.innerHTML = "";

  if (!matches || matches.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 5;
    td.textContent = "Aucun match trouvé dans la base.";
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  matches.sort((a, b) => new Date(a.match_date) - new Date(b.match_date));

  matches.forEach((match) => {
    match.status = getMatchStatus(match);

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${formatMatchDate(match.match_date)}</td>
      <td>${match.player1}</td>
      <td>${match.player2}</td>
      <td>${match.player1_score != null ? `${match.player1_score} - ${match.player2_score}` : "—"}</td>
      <td class="status-${match.status}">${match.status}</td>
    `;

    tbody.appendChild(tr);
  });
}

