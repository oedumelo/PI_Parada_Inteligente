const channels = [
  { id: 3096316, key: "NUQB46X37DE06NP5", label: "Parada 1" },
  { id: 3102167, key: "3EFVUAMPT6UA7AJ3", label: "Parada 2" }
];

let totalClicksChart, hourlyClicksChart, comparacaoFluxoChart, comparacaoDeficienciaChart;
let paradaSelecionada = "todas";
let periodoSelecionado = "24h";

async function fetchData(channel) {
  const url = `https://api.thingspeak.com/channels/${channel.id}/feeds.json?api_key=${channel.key}&results=500`;
  const res = await fetch(url);
  const data = await res.json();
  return data.feeds || [];
}

function prepareHourlyData(feeds) {
  const hours = {};
  feeds.forEach(f => {
    const h = new Date(f.created_at).getHours();
    if (!hours[h]) hours[h] = { visual: 0, fisico: 0 };
    hours[h].visual += parseInt(f.field1) || 0;
    hours[h].fisico += parseInt(f.field2) || 0;
  });
  const labels = Object.keys(hours).sort((a, b) => a - b);
  return {
    labels: labels.map(l => l + ":00"),
    visual: labels.map(h => hours[h].visual),
    fisico: labels.map(h => hours[h].fisico)
  };
}

function calcularLimiteTempo(periodo) {
  const agora = new Date();
  switch (periodo) {
    case "24h":
      agora.setHours(agora.getHours() - 24);
      break;
    case "7d":
      agora.setDate(agora.getDate() - 7);
      break;
    case "1m":
      agora.setMonth(agora.getMonth() - 1);
      break;
    case "3m":
      agora.setMonth(agora.getMonth() - 3);
      break;
    case "6m":
      agora.setMonth(agora.getMonth() - 6);
      break;
    case "1a":
      agora.setFullYear(agora.getFullYear() - 1);
      break;
  }
  return agora;
}

async function updateCharts() {
  let feedsPorCanal = await Promise.all(channels.map(ch => fetchData(ch)));

  if (paradaSelecionada === "1") {
    feedsPorCanal = [feedsPorCanal[0]];
  } else if (paradaSelecionada === "2") {
    feedsPorCanal = [feedsPorCanal[1]];
  }

  const limiteTempo = calcularLimiteTempo(periodoSelecionado);

  feedsPorCanal = feedsPorCanal.map(feeds => {
    const filtrados = feeds.filter(f => new Date(f.created_at) >= limiteTempo);
    return filtrados;
  });

  const allFeeds = feedsPorCanal.flat();
  const totalVisual = allFeeds.reduce((a, f) => a + (parseInt(f.field1) || 0), 0);
  const totalFisico = allFeeds.reduce((a, f) => a + (parseInt(f.field2) || 0), 0);

  document.getElementById("totalVisual").textContent = totalVisual;
  document.getElementById("totalFisico").textContent = totalFisico;

  const topParadaElement = document.getElementById("topParada");
  const fluxoTotal = feedsPorCanal.map(feeds => feeds.reduce((total, feed) => total + (parseInt(feed.field1) || 0) + (parseInt(feed.field2) || 0), 0));
  const totalGeralDeAcionamentos = fluxoTotal.reduce((soma, valorAtual) => soma + valorAtual, 0);

  if (totalGeralDeAcionamentos === 0) {
    topParadaElement.textContent = '–';
  } else {
    if (paradaSelecionada === "todas") {
      topParadaElement.textContent = fluxoTotal[0] >= fluxoTotal[1] ? "Parada 1" : "Parada 2";
    } else {
      topParadaElement.textContent = paradaSelecionada === "1" ? "Parada 1" : "Parada 2";
    }
  }
  
  const { labels, visual, fisico } = prepareHourlyData(allFeeds);

  totalClicksChart.data.datasets[0].data = [totalVisual, totalFisico];
  hourlyClicksChart.data.labels = labels;
  hourlyClicksChart.data.datasets[0].data = visual;
  hourlyClicksChart.data.datasets[1].data = fisico;
  comparacaoFluxoChart.data.datasets[0].data = (feedsPorCanal.length === 1)
    ? [fluxoTotal[0], 0]
    : fluxoTotal;

  comparacaoDeficienciaChart.data.datasets[0].data = feedsPorCanal.map(f => f.reduce((a, f) => a + (parseInt(f.field1) || 0), 0));
  comparacaoDeficienciaChart.data.datasets[1].data = feedsPorCanal.map(f => f.reduce((a, f) => a + (parseInt(f.field2) || 0), 0));

  comparacaoFluxoChart.data.labels = feedsPorCanal.length === 1 ? [channels[paradaSelecionada - 1].label] : ['Parada 1', 'Parada 2'];
  comparacaoDeficienciaChart.data.labels = comparacaoFluxoChart.data.labels;

  totalClicksChart.update();
  hourlyClicksChart.update();
  comparacaoFluxoChart.update();
  comparacaoDeficienciaChart.update();

  document.getElementById("ultimaAtualizacao").textContent = new Date().toLocaleTimeString("pt-BR");
}

function createCharts() {
  totalClicksChart = new Chart(document.getElementById('totalClicksChart'), {
    type: 'bar',
    data: {
      labels: ['Deficiente Visual', 'Deficiente Físico'],
      datasets: [{
        label: 'Total de Cliques',
        data: [0, 0],
        backgroundColor: ['#2b4eff', '#ff8a00']
      }]
    },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
  });

  hourlyClicksChart = new Chart(document.getElementById('hourlyClicksChart'), {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        { label: 'Deficiente Visual', data: [], borderColor: '#2b4eff', backgroundColor: 'rgba(43,78,255,0.2)', tension: 0.4, fill: true },
        { label: 'Deficiente Físico', data: [], borderColor: '#ff8a00', backgroundColor: 'rgba(255,138,0,0.2)', tension: 0.4, fill: true }
      ]
    },
    options: { responsive: true, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }
  });

  comparacaoFluxoChart = new Chart(document.getElementById('comparacaoFluxoChart'), {
    type: 'bar',
    data: {
      labels: ['Parada 1', 'Parada 2'],
      datasets: [{ label: 'Fluxo Total', data: [0, 0], backgroundColor: ['#2b4eff', '#ff8a00'] }]
    },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
  });

  comparacaoDeficienciaChart = new Chart(document.getElementById('comparacaoDeficienciaChart'), {
    type: 'bar',
    data: {
      labels: ['Parada 1', 'Parada 2'],
      datasets: [
        { label: 'Deficiente Visual', data: [0, 0], backgroundColor: '#2b4eff' },
        { label: 'Deficiente Físico', data: [0, 0], backgroundColor: '#ff8a00' }
      ]
    },
    options: { responsive: true, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }
  });

  updateCharts();
  setInterval(updateCharts, 4000);
}

const themeToggle = document.getElementById("temaToggle");
const body = document.body;

function setTema(isDarkMode) {
    body.classList.toggle("dark-mode", isDarkMode);
    themeToggle.checked = isDarkMode;
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
}

themeToggle.addEventListener("change", (e) => {
    setTema(e.target.checked);
});

document.getElementById("paradaSelect").addEventListener("change", (e) => {
  paradaSelecionada = e.target.value;
  updateCharts();
});

document.getElementById("periodoSelect").addEventListener("change", (e) => {
  periodoSelecionado = e.target.value;
  updateCharts();
});

document.getElementById("atualizarBtn").addEventListener("click", updateCharts);


const savedTheme = localStorage.getItem("theme");
setTema(savedTheme === null || savedTheme === "dark");

createCharts();