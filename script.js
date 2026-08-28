const loginForm = document.getElementById('login-form');
const loginCard = document.getElementById('login-card');
const protectedCard = document.getElementById('protected-card');
const logoutButton = document.getElementById('logout-button');
const formTitle = document.getElementById('form-title');
const submitButton = document.getElementById('submit-button');
const toggleFormButton = document.getElementById('toggle-form');
const formMessage = document.getElementById('form-message');
const confirmPasswordField = document.getElementById('confirm-password-field');
const confirmPasswordInput = document.getElementById('confirm-password');
const navLinks = document.querySelectorAll('.nav-link');
const pageTitle = document.getElementById('page-title');
const pageText = document.getElementById('page-text');
const pageBody = document.getElementById('page-body');
const siteStatusBar = document.getElementById('site-status-bar');
const popupOverlay = document.getElementById('popup-overlay');
const popupMessage = document.getElementById('popup-message');
const popupCloseButton = document.getElementById('popup-close-button');

let isSignUpMode = false;
let currentPage = 'home';
let selectedContest = null;
let currentUserEmail = null;
let selectedWeek = 2;
let selectedTeam = null;
const testContestWeek = 2;
let selectedTeams = [];
let selectedLock = null;
let myPicks = loadPicks();
let superLocks = loadSuperLocks();
let joinedContests = loadJoinedContests();

const nflBaseSpreads = [
  { name: 'Buffalo Bills', base: -5.5 },
  { name: 'Miami Dolphins', base: -3.5 },
  { name: 'New England Patriots', base: +1.5 },
  { name: 'New York Jets', base: +3.5 },
  { name: 'Baltimore Ravens', base: -4.0 },
  { name: 'Cincinnati Bengals', base: -2.5 },
  { name: 'Cleveland Browns', base: +0.5 },
  { name: 'Pittsburgh Steelers', base: +4.0 },
  { name: 'Houston Texans', base: +6.5 },
  { name: 'Indianapolis Colts', base: +2.5 },
  { name: 'Jacksonville Jaguars', base: -1.5 },
  { name: 'Tennessee Titans', base: +2.0 },
  { name: 'Kansas City Chiefs', base: -6.5 },
  { name: 'Los Angeles Chargers', base: -3.0 },
  { name: 'Las Vegas Raiders', base: +4.0 },
  { name: 'Denver Broncos', base: +5.5 },
  { name: 'Philadelphia Eagles', base: -7.0 },
  { name: 'Dallas Cowboys', base: -4.0 },
  { name: 'New York Giants', base: +6.0 },
  { name: 'Washington Commanders', base: +7.5 },
  { name: 'Green Bay Packers', base: -1.0 },
  { name: 'Minnesota Vikings', base: -0.5 },
  { name: 'Chicago Bears', base: +5.5 },
  { name: 'Detroit Lions', base: +2.5 },
  { name: 'Tampa Bay Buccaneers', base: +1.0 },
  { name: 'New Orleans Saints', base: -1.5 },
  { name: 'Carolina Panthers', base: +6.0 },
  { name: 'Atlanta Falcons', base: +3.5 },
  { name: 'San Francisco 49ers', base: -8.0 },
  { name: 'Seattle Seahawks', base: -2.0 },
  { name: 'Los Angeles Rams', base: +1.5 },
  { name: 'Arizona Cardinals', base: +8.0 }
];

const teamAbbreviations = {
  'Buffalo Bills': 'BUF',
  'Miami Dolphins': 'MIA',
  'New England Patriots': 'NE',
  'New York Jets': 'NYJ',
  'Baltimore Ravens': 'BAL',
  'Cincinnati Bengals': 'CIN',
  'Cleveland Browns': 'CLE',
  'Pittsburgh Steelers': 'PIT',
  'Houston Texans': 'HOU',
  'Indianapolis Colts': 'IND',
  'Jacksonville Jaguars': 'JAX',
  'Tennessee Titans': 'TEN',
  'Kansas City Chiefs': 'KC',
  'Los Angeles Chargers': 'LAC',
  'Las Vegas Raiders': 'LV',
  'Denver Broncos': 'DEN',
  'Philadelphia Eagles': 'PHI',
  'Dallas Cowboys': 'DAL',
  'New York Giants': 'NYG',
  'Washington Commanders': 'WAS',
  'Green Bay Packers': 'GB',
  'Minnesota Vikings': 'MIN',
  'Chicago Bears': 'CHI',
  'Detroit Lions': 'DET',
  'Tampa Bay Buccaneers': 'TB',
  'New Orleans Saints': 'NO',
  'Carolina Panthers': 'CAR',
  'Atlanta Falcons': 'ATL',
  'San Francisco 49ers': 'SF',
  'Seattle Seahawks': 'SEA',
  'Los Angeles Rams': 'LAR',
  'Arizona Cardinals': 'ARI'
};

const week1Matchups = [
  { away: 'Patriots', home: 'Seahawks', homeLine: '-3.5', day: 'Thu', time: '1:00 PM ET' },
  { away: '49ers', home: 'Rams', homeLine: '-2.5', day: 'Sun', time: '4:05 PM ET' },
  { away: 'Saints', home: 'Lions', homeLine: '-7', day: 'Sun', time: '4:25 PM ET' },
  { away: 'Bills', home: 'Texans', homeLine: '-1.5', day: 'Sun', time: '8:20 PM ET' },
  { away: 'Ravens', home: 'Colts', homeLine: '-3.5', day: 'Sun', time: '1:00 PM ET' },
  { away: 'Bears', home: 'Panthers', homeLine: '-2.5', day: 'Sun', time: '1:00 PM ET' },
  { away: 'Buccaneers', home: 'Bengals', homeLine: '-3.5', day: 'Sun', time: '4:25 PM ET' },
  { away: 'Falcons', home: 'Steelers', homeLine: '-3', day: 'Sun', time: '1:00 PM ET' },
  { away: 'Jets', home: 'Titans', homeLine: '-3', day: 'Sun', time: '4:05 PM ET' },
  { away: 'Browns', home: 'Jaguars', homeLine: '-7', day: 'Sun', time: '1:00 PM ET' },
  { away: 'Commanders', home: 'Eagles', homeLine: '-5.5', day: 'Sun', time: '4:25 PM ET' },
  { away: 'Cardinals', home: 'Chargers', homeLine: '-11.5', day: 'Sun', time: '4:05 PM ET' },
  { away: 'Dolphins', home: 'Raiders', homeLine: '-3', day: 'Sun', time: '4:25 PM ET' },
  { away: 'Packers', home: 'Vikings', homeLine: '-1.5', day: 'Mon', time: '8:15 PM ET' },
  { away: 'Cowboys', home: 'Giants', homeLine: '-2.5', day: 'Sun', time: '4:25 PM ET' },
  { away: 'Broncos', home: 'Chiefs', homeLine: '-2.5', day: 'Sun', time: '8:20 PM ET' }
];

function formatSpread(value) {
  const formatted = value.toFixed(1).replace('.0', '');
  return value >= 0 ? `+${formatted}` : `${formatted}`;
}

function invertLine(line) {
  return line.startsWith('-') ? `+${line.slice(1)}` : `-${line.replace('+', '')}`;
}

function updateSiteStatusBar() {
  if (!siteStatusBar) {
    return;
  }

  const now = new Date();
  const formatter = new Intl.DateTimeFormat([], {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  siteStatusBar.textContent = `Week 2 • Local time: ${formatter.format(now)}`;
}

function startLiveClock() {
  updateSiteStatusBar();
  setInterval(updateSiteStatusBar, 1000);
}

function getMatchupSortValue(matchup) {
  const dayOrder = { Mon: 7, Tue: 6, Wed: 3, Thu: 4, Fri: 5, Sat: 2, Sun: 1 };
  const dayValue = dayOrder[matchup.day] ?? 99;
  const timeValue = matchup.time || '00:00 PM ET';
  const numericTime = Number(timeValue.replace(/[^\d]/g, '').slice(0, 4)) || 0;
  return [dayValue, numericTime, timeValue];
}

function getCurrentContestWeek(date = new Date()) {
  if (testContestWeek) {
    return testContestWeek;
  }

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const currentDate = new Date(year, month, day);
  const startOfWeek = new Date(currentDate);
  const dayOfWeek = currentDate.getDay();
  const daysToWednesday = (dayOfWeek + 5) % 7;
  startOfWeek.setDate(currentDate.getDate() - daysToWednesday);
  startOfWeek.setHours(0, 0, 0, 0);

  const referenceDate = new Date(2024, 8, 4);
  const diffInDays = Math.floor((startOfWeek - referenceDate) / 86_400_000);
  return Math.floor(diffInDays / 7) + 1;
}

function loadPicks() {
  try {
    return JSON.parse(localStorage.getItem('super7-picks') || '[]');
  } catch {
    return [];
  }
}

function savePicks() {
  localStorage.setItem('super7-picks', JSON.stringify(myPicks));
}

function loadSuperLocks() {
  try {
    return JSON.parse(localStorage.getItem('super7-super-locks') || '{}');
  } catch {
    return {};
  }
}

function saveSuperLocks() {
  localStorage.setItem('super7-super-locks', JSON.stringify(superLocks));
}

function loadJoinedContests() {
  try {
    return JSON.parse(localStorage.getItem('super7-joined-contests') || '[]');
  } catch {
    return [];
  }
}

function saveJoinedContests() {
  localStorage.setItem('super7-joined-contests', JSON.stringify(joinedContests));
}

function joinContest(contestId) {
  if (!joinedContests.includes(contestId)) {
    joinedContests.push(contestId);
    saveJoinedContests();
  }
}

function isContestJoined(contestId) {
  return joinedContests.includes(contestId);
}

function loadTestScores() {
  try {
    return JSON.parse(localStorage.getItem('super7-test-scores') || '{}');
  } catch {
    return {};
  }
}

function saveTestScores() {
  localStorage.setItem('super7-test-scores', JSON.stringify(testScores));
}

function getDisplayName(email = currentUserEmail) {
  if (!email) {
    return 'You';
  }

  const key = `super7-display-name:${email}`;
  const stored = localStorage.getItem(key);
  if (stored && stored.trim()) {
    return stored.trim();
  }

  return email;
}

function saveDisplayName(name, email = currentUserEmail) {
  if (!email) {
    return;
  }

  const trimmed = (name || '').trim();
  const key = `super7-display-name:${email}`;
  if (trimmed) {
    localStorage.setItem(key, trimmed);
  } else {
    localStorage.removeItem(key);
  }
}

function loadStandingsUsers() {
  try {
    const stored = JSON.parse(localStorage.getItem('super7-standings-users') || 'null');
    if (stored) {
      return stored;
    }
  } catch {
    // ignore
  }

  return [
    {
      name: getDisplayName(currentUserEmail),
      picks: myPicks,
      superLocks: superLocks
    },
    {
      name: 'Alex',
      picks: [
        { week: 1, away: 'Browns', home: 'Jaguars', team: 'Jaguars', line: '-7', matchup: 'Browns @ Jaguars', awayScore: 3, homeScore: 10, correct: false, push: false },
        { week: 1, away: 'Packers', home: 'Vikings', team: 'Packers', line: '+1.5', matchup: 'Packers @ Vikings', awayScore: 26, homeScore: 29, correct: false, push: false }
      ],
      superLocks: { 1: 'Packers' }
    },
    {
      name: 'Jordan',
      picks: [
        { week: 1, away: 'Browns', home: 'Jaguars', team: 'Browns', line: '+7', matchup: 'Browns @ Jaguars', awayScore: 3, homeScore: 10, correct: true, push: false },
        { week: 1, away: 'Packers', home: 'Vikings', team: 'Vikings', line: '-1.5', matchup: 'Packers @ Vikings', awayScore: 26, homeScore: 29, correct: false, push: true }
      ],
      superLocks: { 1: 'Browns' }
    }
  ];
}

function saveStandingsUsers(users) {
  localStorage.setItem('super7-standings-users', JSON.stringify(users));
}

function setTestScore(week, away, home, awayScore, homeScore) {
  const key = `${week}|${away}@${home}`;
  testScores[key] = { awayScore: Number(awayScore), homeScore: Number(homeScore) };
  saveTestScores();
}

let testScores = loadTestScores();

// For testing: pretend Jaguars (home) beat Browns 10-3 in Week 1
setTestScore(1, 'Browns', 'Jaguars', 3, 10);

function getPicksForWeek(week) {
  return myPicks.filter((pick) => pick.week === week);
}

function getSuperLockForWeek(week) {
  return superLocks[week] || null;
}

function getLatestSavedWeek() {
  if (!myPicks.length) {
    return 1;
  }
  return myPicks.reduce((latest, pick) => Math.max(latest, pick.week), 1);
}

function hasSavedPicksForCurrentWeek() {
  return myPicks.some((pick) => pick.week === getLatestSavedWeek());
}

function getWeekStartDate(week, date = new Date()) {
  const weekStart = new Date(date);
  const currentDay = weekStart.getDay();
  const daysToWednesday = (currentDay + 5) % 7;
  weekStart.setDate(weekStart.getDate() - daysToWednesday);
  weekStart.setHours(0, 0, 0, 0);

  const weekOffset = week - getCurrentContestWeek(date);
  weekStart.setDate(weekStart.getDate() + (weekOffset * 7));
  return weekStart;
}

function getMatchupKickoffDate(matchup, week) {
  const weekStart = getWeekStartDate(week);
  const dayOffsets = { Wed: 0, Thu: 1, Fri: 2, Sat: 3, Sun: 4, Mon: 5, Tue: 6 };
  const dayOffset = dayOffsets[matchup.day] ?? 0;
  const kickoff = new Date(weekStart);
  kickoff.setDate(weekStart.getDate() + dayOffset);

  const timeMatch = (matchup.time || '').match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (timeMatch) {
    let hours = Number(timeMatch[1]);
    const minutes = Number(timeMatch[2] || 0);
    const meridiem = timeMatch[3].toUpperCase();
    if (meridiem === 'PM' && hours < 12) {
      hours += 12;
    }
    if (meridiem === 'AM' && hours === 12) {
      hours = 0;
    }
    kickoff.setHours(hours, minutes, 0, 0);
  }

  return kickoff;
}

function canEditMatchup(matchup, week) {
  return canEditPicksForWeek(week);
}

function canEditPicksForWeek(week) {
  return Number(week) === getCurrentContestWeek();
}

function getMatchupForPick(pick) {
  const week = contests.super7.weeks[pick.week - 1];
  return week?.matchups.find(
    (matchup) =>
      (matchup.home === pick.home && matchup.away === pick.away) ||
      (matchup.home === pick.away && matchup.away === pick.home)
  );
}

function generateActualScore(week, matchup) {
  const seed = [...matchup.away, ...matchup.home].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) + week * 13;
  const awayScore = 14 + (seed % 17);
  const desiredMargin = Number(matchup.homeLine);
  const homeScore = Math.max(awayScore - 7, Math.min(awayScore + 14, awayScore + Math.round(desiredMargin + ((seed % 9) - 4))));
  return { awayScore, homeScore };
}

function getPickOutcome(pick, matchup) {
  let awayScore = 0, homeScore = 0;
  if (matchup) {
    const key = `${pick.week}|${matchup.away}@${matchup.home}`;
    const override = testScores && testScores[key];
    if (override) {
      awayScore = Number(override.awayScore);
      homeScore = Number(override.homeScore);
    } else {
      ({ awayScore, homeScore } = generateActualScore(pick.week, matchup));
    }
  }
  const spread = Number(matchup.homeLine);
  const cover = pick.team === matchup.home ? homeScore - awayScore + spread : awayScore - homeScore - spread;
  const push = Math.abs(cover) < 0.5;
  const correct = !push && cover > 0;
  return {
    awayScore,
    homeScore,
    score: `${awayScore}-${homeScore}`,
    correct,
    push
  };
}

function getStandingsRows() {
  const standingsUsers = loadStandingsUsers();
  const standings = standingsUsers.map((user) => {
    const userPicks = Array.isArray(user.picks) ? user.picks : [];
    const userSuperLocks = user.superLocks || {};
    let correct = 0;
    let pushes = 0;
    let incorrect = 0;
    let superLockCorrect = 0;
    let superLockPushes = 0;
    let superLockIncorrect = 0;
    let points = 0;

    userPicks.forEach((pick) => {
      const matchup = getMatchupForPick(pick);
      if (!matchup) {
        return;
      }

      const outcome = getPickOutcome(pick, matchup);
      const isSuperLock = userSuperLocks[pick.week] === pick.team;
      const pickPoints = outcome.push ? 0.5 : outcome.correct ? 1 : 0;
      const totalPoints = isSuperLock ? pickPoints * 2 : pickPoints;

      points += totalPoints;
      if (outcome.push) {
        pushes += 1;
        if (isSuperLock) {
          superLockPushes += 1;
        }
      } else if (outcome.correct) {
        correct += 1;
        if (isSuperLock) {
          superLockCorrect += 1;
        }
      } else {
        incorrect += 1;
        if (isSuperLock) {
          superLockIncorrect += 1;
        }
      }
    });

    return {
      name: user.name,
      points: Number(points.toFixed(1)),
      correct,
      pushes,
      incorrect,
      pickRecord: `${correct} - ${incorrect} - ${pushes}`,
      superLockRecord: `${superLockCorrect} - ${superLockIncorrect} - ${superLockPushes}`
    };
  });

  return standings.sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
}

function formatSelection(matchups, selectedTeam) {
  const pick = myPicks.find((item) => item.team === selectedTeam);
  if (pick) {
    return `${pick.team} (${pick.matchup}, ${pick.line})`;
  }

  for (const matchup of matchups) {
    if (matchup.away === selectedTeam) {
      return `${matchup.away} @ ${matchup.home} (${matchup.home} ${matchup.homeLine})`;
    }
    if (matchup.home === selectedTeam) {
      return `${matchup.home} @ ${matchup.away} (${matchup.home} ${matchup.homeLine})`;
    }
  }
  return selectedTeam;
}

function updatePickedTeam(week, matchupIndex, team) {
  const matchup = contests.super7.weeks[week - 1].matchups[matchupIndex];
  const opponent = team === matchup.home ? matchup.away : matchup.home;

  if (selectedTeams.includes(team)) {
    selectedTeams = selectedTeams.filter((item) => item !== team);
    if (selectedLock && !selectedTeams.includes(selectedLock)) {
      selectedLock = null;
    }
    return;
  }

  if (selectedTeams.includes(opponent)) {
    selectedTeams = selectedTeams.filter((item) => item !== opponent);
  }

  if (selectedTeams.length >= 7) {
    showMessage('You must select exactly 7 games before saving.');
    return;
  }

  selectedTeams.push(team);
  if (selectedLock && !selectedTeams.includes(selectedLock)) {
    selectedLock = null;
  }
}

function saveWeekPicks() {
  const weekMatchups = contests.super7.weeks[selectedWeek - 1].matchups;
  if (selectedTeams.length !== 7) {
    showMessage('You must select exactly 7 games before saving.');
    return;
  }

  if (!selectedLock || !selectedTeams.includes(selectedLock)) {
    showMessage('You must choose a Super Lock before saving.');
    return;
  }

  if (selectedLock && !selectedTeams.includes(selectedLock)) {
    selectedLock = null;
  }

  const picksForWeek = selectedTeams.map((team) => {
    const matchup = weekMatchups.find((m) => m.away === team || m.home === team);
    const line = team === matchup.home ? matchup.homeLine : invertLine(matchup.homeLine);
    const outcome = getPickOutcome({ week: selectedWeek, team, home: matchup.home, away: matchup.away }, matchup);
    return {
      week: selectedWeek,
      away: matchup.away,
      home: matchup.home,
      team,
      line,
      matchup: `${matchup.away} @ ${matchup.home}`,
      awayScore: outcome.awayScore,
      homeScore: outcome.homeScore,
      score: outcome.score,
      correct: outcome.correct,
      push: outcome.push
    };
  });

  myPicks = myPicks.filter((pick) => pick.week !== selectedWeek).concat(picksForWeek);
  savePicks();

  if (selectedLock) {
    superLocks[selectedWeek] = selectedLock;
  } else {
    delete superLocks[selectedWeek];
  }
  saveSuperLocks();

  showMessage(`Saved ${selectedTeams.length} picks for Week ${selectedWeek}.`);
}

function generateWeekMatchups(week) {
  if (week === 1) {
    return week1Matchups;
  }

  const adjustment = ((week - 1) % 7 - 3) * 0.5;
  const matchupTimes = ['1:00 PM ET', '4:05 PM ET', '4:25 PM ET', '8:20 PM ET'];
  const matchupDays = ['Sun', 'Sun', 'Sun', 'Mon'];
  return Array.from({ length: 16 }, (_, index) => {
    const away = nflBaseSpreads[index * 2];
    const home = nflBaseSpreads[index * 2 + 1];
    return {
      away: away.name,
      home: home.name,
      homeLine: formatSpread(home.base + adjustment),
      day: matchupDays[index % matchupDays.length],
      time: matchupTimes[index % matchupTimes.length]
    };
  });
}

const contests = {
  super7: {
    id: 'super7',
    name: 'Super 7',
    description: 'Pick seven NFL teams against the spread for each week, from Week 1 through Week 18.',
    weeks: Array.from({ length: 18 }, (_, index) => ({
      week: index + 1,
      matchups: generateWeekMatchups(index + 1)
    }))
  }
};

checkSession();
startLiveClock();

loginForm.addEventListener('submit', function (event) {
  event.preventDefault();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;

  const endpoint = isSignUpMode ? '/api/signup' : '/api/login';
  const body = { email, password };

  if (isSignUpMode) {
    const confirmPassword = confirmPasswordInput.value;

    if (password !== confirmPassword) {
      showMessage('Passwords do not match.');
      return;
    }
  }

  fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(body)
  })
    .then(async function (response) {
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Unable to complete the request.');
      }
      return result;
    })
    .then(function (result) {
      currentUserEmail = result.email;
      loginForm.reset();
      showProtectedPage();
    })
    .catch(function (error) {
      showMessage(error.message);
    });
});

toggleFormButton.addEventListener('click', function () {
  isSignUpMode = !isSignUpMode;
  formTitle.textContent = isSignUpMode ? 'Create your account' : 'Log in';
  submitButton.textContent = isSignUpMode ? 'Create account' : 'Log in';
  toggleFormButton.textContent = isSignUpMode ? 'Back to login' : 'Create an account';
  confirmPasswordField.classList.toggle('hidden', !isSignUpMode);
  confirmPasswordInput.required = isSignUpMode;
  formMessage.textContent = '';
  loginForm.reset();
});

logoutButton.addEventListener('click', function () {
  fetch('/api/logout', { method: 'POST', credentials: 'same-origin' })
    .finally(function () {
      currentUserEmail = null;
      formMessage.textContent = '';
      loginCard.classList.remove('hidden');
      protectedCard.classList.add('hidden');
      currentPage = 'home';
    });
});

navLinks.forEach(function (link) {
  link.addEventListener('click', function () {
    selectPage(link.dataset.page);
  });
});

function checkSession() {
  fetch('/api/session', { credentials: 'same-origin' })
    .then(function (response) {
      if (!response.ok) {
        return null;
      }
      return response.json();
    })
    .then(function (result) {
      if (result?.email) {
        currentUserEmail = result.email;
        showProtectedPage();
      }
    });
}

function renderHomePage() {
  pageTitle.textContent = 'Home';
  pageText.textContent = 'This is the home page.';
  pageBody.innerHTML = '';
  updateSiteStatusBar();
}

function renderNewsPage() {
  pageTitle.textContent = 'Standings';
  pageText.textContent = 'Current conference standings.';
  updateSiteStatusBar();
  pageBody.innerHTML = `
    <div class="contest-card">
      <div class="contest-card-header">
        <h2>NFL Standings</h2>
        <p>Live-style standings view for the current season.</p>
      </div>
      <div class="contest-card">
        <p><strong>AFC East</strong></p>
        <p>Buffalo Bills 4-2</p>
        <p>Miami Dolphins 3-3</p>
        <p>New England Patriots 2-4</p>
        <p>New York Jets 2-4</p>
      </div>
      <div class="contest-card">
        <p><strong>NFC North</strong></p>
        <p>Green Bay Packers 4-2</p>
        <p>Detroit Lions 4-2</p>
        <p>Chicago Bears 2-4</p>
        <p>Minnesota Vikings 2-4</p>
      </div>
    </div>
  `;
}

function renderMyInfoPage() {
  pageTitle.textContent = 'My Info';
  pageText.textContent = 'Update how your name appears in the standings.';
  updateSiteStatusBar();

  const currentName = getDisplayName(currentUserEmail);
  pageBody.innerHTML = `
    <div class="contest-card">
      <div class="contest-card-header">
        <h2>Standings name</h2>
        <p>Your name defaults to your email address and can be changed here.</p>
      </div>
      <form id="display-name-form">
        <label for="display-name">Name</label>
        <input type="text" id="display-name" name="display-name" value="${currentName}" maxlength="40" />
        <button type="submit" class="secondary-button">Save name</button>
      </form>
    </div>
  `;

  const form = pageBody.querySelector('#display-name-form');
  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const nameInput = pageBody.querySelector('#display-name');
      if (!nameInput) {
        return;
      }

      saveDisplayName(nameInput.value, currentUserEmail);
      showMessage('Display name updated.');
      renderMyInfoPage();
    });
  }
}

function renderContestsPage() {
  pageTitle.textContent = 'Contests';
  pageText.textContent = 'Available contests to join.';
  const isJoined = isContestJoined(contests.super7.id);
  updateSiteStatusBar();

  pageBody.innerHTML = `
    <div class="contest-list">
      <div class="contest-card">
        <div class="contest-card-header">
          <h2>${contests.super7.name}</h2>
          <p>${contests.super7.description}</p>
          <p><strong>${myPicks.length}</strong> of 7 picks saved.</p>
        </div>
        <button type="button" class="select-contest-button" data-contest="super7">${isJoined ? 'View Super 7' : 'Join Super 7'}</button>
        <button type="button" class="secondary-button" id="view-my-picks">View My Picks</button>
      </div>
    </div>
  `;

  const contestButton = pageBody.querySelector('.select-contest-button');
  if (contestButton) {
    contestButton.addEventListener('click', function () {
      if (!isJoined) {
        joinContest(contests.super7.id);
        renderContestsPage();
        return;
      }

      selectedContest = contests.super7.id;
      selectedWeek = null;
      selectedTeams = [];
      selectedLock = null;
      renderSuper7Contest();
    });
  }

  const viewPicksButton = pageBody.querySelector('#view-my-picks');
  if (viewPicksButton) {
    viewPicksButton.addEventListener('click', function () {
      selectPage('mypicks');
    });
  }
}

function renderSuper7Contest() {
  const contest = contests.super7;
  const currentWeek = getCurrentContestWeek();
  const availableWeeks = contest.weeks.filter((week) => week.week <= currentWeek);
  if (!selectedWeek || selectedWeek > currentWeek) {
    selectedWeek = currentWeek;
  }
  const weekData = selectedWeek ? contest.weeks[selectedWeek - 1] : null;
  const isEditableWeek = selectedWeek === currentWeek && canEditPicksForWeek(selectedWeek);
  pageTitle.textContent = contest.name;
  pageText.textContent = contest.description;
  const sortedMatchups = [...(weekData?.matchups || [])].sort((a, b) => {
    const left = getMatchupSortValue(a);
    const right = getMatchupSortValue(b);
    return left[0] - right[0] || left[1] - right[1] || left[2].localeCompare(right[2]);
  });

  pageBody.innerHTML = `
    <div class="contest-card">
      <div class="contest-card-header">
        <h2>${contest.name}</h2>
        <p>Super 7 - Week ${selectedWeek || 1}</p>
      </div>
      <div class="week-selector">
        ${availableWeeks.map((week) => `
          <button type="button" class="week-button${week.week === selectedWeek ? ' active' : ''}" data-week="${week.week}">Wk ${week.week}</button>
        `).join('')}
      </div>
      ${selectedWeek ? `
        <div class="contest-summary">
          <p>${isEditableWeek ? `Select 7 games for Week ${selectedWeek}. You must choose exactly 7 games and one Super Lock before saving.` : `Week ${selectedWeek} is locked for editing.`}</p>
          <p><strong>${selectedTeams.length}</strong> selected</p>
        </div>
        <div class="matchup-grid">
          ${sortedMatchups.map((matchup, matchupIndex) => {
            const awayLine = invertLine(matchup.homeLine);
            const awaySelected = selectedTeams.includes(matchup.away);
            const homeSelected = selectedTeams.includes(matchup.home);
            const matchupDay = matchup.day || 'TBD';
            const matchupTime = matchup.time || 'Time TBD';
            return `
              <div class="matchup-row">
                <div class="matchup-pick-row">
                  <button type="button" class="select-team-button${awaySelected ? ' selected' : ''}" data-matchup-index="${matchupIndex}" data-team="${matchup.away}" data-away="${matchup.away}" data-home="${matchup.home}" data-home-line="${matchup.homeLine}">${matchup.away} ${awayLine}</button>
                  ${awaySelected ? `<button type="button" class="super-lock-toggle${selectedLock === matchup.away ? ' active' : ''}" data-team="${matchup.away}" aria-label="${selectedLock === matchup.away ? 'Remove Super Lock from' : 'Set'} ${matchup.away}">${selectedLock === matchup.away ? '🔒' : '🔓'}</button>` : ''}
                </div>
                <span class="matchup-vs">@</span>
                <div class="matchup-pick-row">
                  <button type="button" class="select-team-button home${homeSelected ? ' selected' : ''}" data-matchup-index="${matchupIndex}" data-team="${matchup.home}" data-away="${matchup.away}" data-home="${matchup.home}" data-home-line="${matchup.homeLine}">${matchup.home} ${matchup.homeLine}</button>
                  ${homeSelected ? `<button type="button" class="super-lock-toggle${selectedLock === matchup.home ? ' active' : ''}" data-team="${matchup.home}" aria-label="${selectedLock === matchup.home ? 'Remove Super Lock from' : 'Set'} ${matchup.home}">${selectedLock === matchup.home ? '🔒' : '🔓'}</button>` : ''}
                </div>
                <div class="matchup-time">${matchupDay} • ${matchupTime}</div>
              </div>
            `;
          }).join('')}
        </div>
        ${isEditableWeek ? `
          <div class="selection-summary">
            ${selectedTeams.length ? `<p class="help-text">${selectedLock ? `Super Lock: ${selectedLock}` : 'Tap the padlock next to a selected team to mark it as your Super Lock.'}</p>` : '<p class="help-text">No teams selected yet.</p>'}
          </div>
          <div class="button-row">
            <button type="button" class="secondary-button" id="save-week-picks">Save picks</button>
            <button type="button" class="secondary-button" id="clear-week-picks">Clear selections</button>
          </div>
        ` : '<p class="help-text">This week is locked and cannot be edited.</p>'}
      ` : '<p class="help-text">Choose a week to view the matchup board and build your 7-game card.</p>'}
      <button type="button" class="secondary-button" id="back-to-contests">Back to contests</button>
    </div>
  `;

    pageBody.querySelectorAll('.week-button').forEach((button) => {
    button.addEventListener('click', function () {
      const week = Number(button.dataset.week);
      if (week !== getCurrentContestWeek()) {
        showPopupMessage(`Week ${week} is locked and can't be edited.`);
        return;
      }
      selectedWeek = week;
      selectedTeams = getPicksForWeek(selectedWeek).map((pick) => pick.team);
      selectedLock = getSuperLockForWeek(selectedWeek);
      renderSuper7Contest();
    });
  });

  updateSiteStatusBar();

  pageBody.querySelectorAll('.select-team-button').forEach((button) => {
    button.addEventListener('click', function () {
      if (!isEditableWeek) {
        showPopupMessage(`Week ${selectedWeek} is locked and can't be edited.`);
        return;
      }
      const team = button.dataset.team;
      const matchupIndex = Number(button.dataset.matchupIndex);
      updatePickedTeam(selectedWeek, matchupIndex, team);
      renderSuper7Contest();
    });
  });

  const saveButton = pageBody.querySelector('#save-week-picks');
  if (saveButton) {
    saveButton.addEventListener('click', function () {
      if (!isEditableWeek) {
        showPopupMessage(`Week ${selectedWeek} is locked and can't be edited.`);
        return;
      }
      saveWeekPicks();
      showMessage('Picks saved. Taking you to My Picks.');
      selectPage('mypicks');
    });
  }

  pageBody.querySelectorAll('.super-lock-toggle').forEach((button) => {
    button.addEventListener('click', function () {
      if (!isEditableWeek) {
        showPopupMessage(`Week ${selectedWeek} is locked and can't be edited.`);
        return;
      }
      const team = button.dataset.team;
      selectedLock = selectedLock === team ? null : team;
      renderSuper7Contest();
    });
  });

  const clearButton = pageBody.querySelector('#clear-week-picks');
  if (clearButton) {
    clearButton.addEventListener('click', function () {
      if (!isEditableWeek) {
        showPopupMessage(`Week ${selectedWeek} is locked and can't be edited.`);
        return;
      }
      selectedTeams = [];
      selectedLock = null;
      showMessage('Cleared selections and Super Lock for this week.');
      renderSuper7Contest();
    });
  }

  const backButton = pageBody.querySelector('#back-to-contests');
  if (backButton) {
    backButton.addEventListener('click', function () {
      selectedContest = null;
      renderContestsPage();
    });
  }
}

function selectPage(page) {
  currentPage = page;
  navLinks.forEach(function (link) {
    link.classList.toggle('active', link.dataset.page === page);
  });

  selectedContest = null;
  selectedWeek = 1;
  selectedTeam = null;

  if (page === 'home') {
    renderHomePage();
  } else if (page === 'contests') {
    renderContestsPage();
  } else if (page === 'news') {
    renderNewsPage();
  } else if (page === 'myinfo' || page === 'about') {
    renderMyInfoPage();
  } else if (page === 'mypicks') {
    renderMyPicksPage();
  } else {
    renderHomePage();
  }
}

function renderNewsPage() {
  pageTitle.textContent = 'Standings';
  pageText.textContent = 'Current contest standings for all players.';

  const standings = getStandingsRows();
  pageBody.innerHTML = `
    <div class="contest-card">
      <div class="contest-card-header">
        <h2>Contest Standings</h2>
        <p>Players earn 1 point for a correct pick, 0.5 for a push, and 0 for an incorrect pick. Super locks are worth double.</p>
      </div>
      <table class="mypicks-table">
        <thead>
          <tr>
            <th>Player</th>
            <th>Points</th>
            <th>Pick Record</th>
            <th>Super Lock Record</th>
          </tr>
        </thead>
        <tbody>
          ${standings.map((row) => `
            <tr>
              <td>${row.name}</td>
              <td>${row.points}</td>
              <td>${row.pickRecord}</td>
              <td>${row.superLockRecord}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderMyPicksPage() {
  pageTitle.textContent = 'My Picks';
  pageText.textContent = 'Your saved Super 7 selections.';
  updateSiteStatusBar();

  const currentWeek = getCurrentContestWeek();
  const picksByWeek = myPicks
    .sort((a, b) => a.week - b.week)
    .reduce((groups, pick) => {
      if (!groups[pick.week]) groups[pick.week] = [];
      groups[pick.week].push(pick);
      return groups;
    }, {});

  const visibleWeeks = Array.from(new Set([...(Object.keys(picksByWeek).map(Number)), currentWeek]))
    .filter((week) => week <= currentWeek)
    .sort((a, b) => a - b);

  if (!visibleWeeks.length) {
    pageBody.innerHTML = '<p>You have not saved any picks yet. Go to Contests to join Super 7 and save selections.</p>';
    return;
  }

  pageBody.innerHTML = `
    <div class="contest-list">
      ${visibleWeeks.map((week) => {
        const lock = superLocks[week];
        const weekPicks = picksByWeek[week] || [];
        const isOpen = week === currentWeek;
        const showEditButton = week === currentWeek && canEditPicksForWeek(week);
        return `
          <div class="contest-card">
            <button type="button" class="week-dropdown-toggle${isOpen ? ' open' : ''}" data-week="${week}">
              <span>Week ${week}</span>
              <span>${isOpen ? '▾' : '▸'}</span>
            </button>
            <div class="week-dropdown-content${isOpen ? ' open' : ''}">
              ${showEditButton ? `<button type="button" class="secondary-button edit-week-picks-button" data-week="${week}">Edit Picks</button>` : ''}
              ${weekPicks.length
                ? `<table class="mypicks-table">
                    <thead>
                      <tr>
                        <th>Pick</th>
                        <th>Score</th>
                        <th>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${weekPicks
                        .map((pick) => {
                          const matchup = getMatchupForPick(pick);
                          const outcome = getPickOutcome(pick, matchup);
                          const opponent = pick.team === pick.home ? pick.away : pick.home;
                          const pickText = pick.team === pick.home
                            ? `${opponent} @ <strong class="pick-choice">${pick.team} ${pick.line}</strong>`
                            : `<strong class="pick-choice">${pick.team} ${pick.line}</strong> @ ${opponent}`;
                          const lockText = lock === pick.team ? ' <span class="pick-lock-label">(Super Lock)</span>' : '';
                          let resultMark = '';
                          if (outcome.push) {
                            resultMark = lock === pick.team
                              ? '<span class="result-mark push">=</span><span class="result-mark push">=</span>'
                              : '<span class="result-mark push">=</span>';
                          } else if (lock === pick.team) {
                            resultMark = outcome.correct
                              ? '<span class="result-mark correct">✅</span><span class="result-mark correct">✅</span>'
                              : '<span class="result-mark incorrect">❌</span><span class="result-mark incorrect">❌</span>';
                          } else {
                            resultMark = outcome.correct
                              ? '<span class="result-mark correct">✅</span>'
                              : '<span class="result-mark incorrect">❌</span>';
                          }
                          const pickedAbbrev = teamAbbreviations[pick.team] || pick.team;
                          const opponentAbbrev = teamAbbreviations[opponent] || opponent;
                          const spreadDisplay = `(${pick.line})`;
                          const firstLine = pick.team === pick.home
                            ? `${pickedAbbrev} ${spreadDisplay} ${outcome.homeScore}`
                            : `${pickedAbbrev} ${spreadDisplay} ${outcome.awayScore}`;
                          const secondLine = pick.team === pick.home
                            ? `${opponentAbbrev} ${outcome.awayScore}`
                            : `${opponentAbbrev} ${outcome.homeScore}`;
                          return `
                            <tr>
                              <td>${pickText}${lockText}</td>
                              <td class="stacked-score"><div>${firstLine}</div><div>${secondLine}</div></td>
                              <td>${resultMark}</td>
                            </tr>
                          `;
                        })
                        .join('')}
                    </tbody>
                  </table>`
                : '<p class="help-text">No picks saved for this week yet.</p>'}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  pageBody.querySelectorAll('.week-dropdown-toggle').forEach((button) => {
    button.addEventListener('click', function () {
      const week = button.dataset.week;
      const content = button.nextElementSibling;
      const isOpen = button.classList.contains('open');

      pageBody.querySelectorAll('.week-dropdown-toggle').forEach((toggle) => {
        toggle.classList.remove('open');
        const panel = toggle.nextElementSibling;
        if (panel) {
          panel.classList.remove('open');
        }
      });

      if (!isOpen) {
        button.classList.add('open');
        if (content) {
          content.classList.add('open');
        }
      }
    });
  });

  pageBody.querySelectorAll('.edit-week-picks-button').forEach((button) => {
    button.addEventListener('click', function () {
      const week = Number(button.dataset.week);
      if (!canEditPicksForWeek(week)) {
        showMessage('Picks can no longer be edited once games start.');
        return;
      }

      selectedWeek = week;
      selectedTeams = getPicksForWeek(selectedWeek).map((pick) => pick.team);
      selectedLock = getSuperLockForWeek(selectedWeek);
      selectedContest = contests.super7.id;
      renderSuper7Contest();
    });
  });
}

function showMessage(message) {
  formMessage.textContent = message;
}

popupCloseButton.addEventListener('click', hidePopupMessage);
popupOverlay.addEventListener('click', function (event) {
  if (event.target === popupOverlay) {
    hidePopupMessage();
  }
});

function showPopupMessage(message) {
  if (!popupOverlay || !popupMessage) {
    return;
  }

  popupMessage.textContent = message;
  popupOverlay.classList.remove('hidden');
}

function hidePopupMessage() {
  if (!popupOverlay) {
    return;
  }

  popupOverlay.classList.add('hidden');
}

function showProtectedPage() {
  loginCard.classList.add('hidden');
  protectedCard.classList.remove('hidden');

  if (hasSavedPicksForCurrentWeek()) {
    currentPage = 'mypicks';
  }

  selectPage(currentPage);
}
