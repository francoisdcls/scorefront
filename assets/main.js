const API_BASE_URL = "https://apiscore-qihw.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page;
    if (page === "home") initHomePage();
    else if (page === "results") initResultsPage();
});

async function initHomePage() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/matches`);
        if (!response.ok) throw new Error("Erreur API");
        const matches = await response.json();

        // On trie : les plus récents en premier
        const sorted = matches.sort((a, b) => new Date(b.match_date) - new Date(a.match_date));
        
        // On cherche le dernier match joué (qui a un score)
        const lastPlayed = sorted.find(m => m.player1_score !== null);
        // On cherche le prochain match (qui n'a pas encore de score)
        const nextMatch = sorted.filter(m => m.player1_score === null).reverse()[0];

        updateHomeUI(nextMatch, lastPlayed);
    } catch (error) {
        console.error(error);
        document.getElementById("error-message").textContent = "Connexion à l'API impossible.";
    }
}

function updateHomeUI(next, last) {
    const nextDiv = document.getElementById("next-match");
    const lastDiv = document.getElementById("last-match");

    if (next) {
        nextDiv.innerHTML = `<p><strong>${next.player1}</strong> vs <strong>${next.player2}</strong><br>Prévu le : ${new Date(next.match_date).toLocaleDateString()}</p>`;
    } else {
        nextDiv.innerHTML = "<p>Aucun match prévu.</p>";
    }

    if (last) {
        lastDiv.innerHTML = `<p><strong>${last.player1}</strong> (${last.player1_score}) - (${last.player2_score}) <strong>${last.player2}</strong><br>Vainqueur : ${last.winner || "Non défini"}</p>`;
    } else {
        lastDiv.innerHTML = "<p>Aucun résultat récent.</p>";
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
            const score = m.player1_score !== null ? `${m.player1_score} - ${m.player2_score}` : "—";
            tr.innerHTML = `
                <td>${new Date(m.match_date).toLocaleDateString()}</td>
                <td>${m.player1}</td>
                <td>${m.player2}</td>
                <td>${score}</td>
                <td>${m.round_name}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) { console.error(e); }
}