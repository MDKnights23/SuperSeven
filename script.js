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
let currentEditingPlayerName = null;
let selectedWeek = 2;
let selectedTeam = null;
let selectedTeams = [];
let selectedLock = null;
let myPicks = loadPicks();
let superLocks = loadSuperLocks();
let joinedContests = loadJoinedContests();

const COMMISSIONER_EMAIL = 'matthewhellmann2013@gmail.com';
const USER_ROLES = {
  PLAYER: 'Player',
  COMMISSIONER: 'Commissioner'
};

function getCurrentUserRole(email = currentUserEmail) {
  if (email && email.toLowerCase() === COMMISSIONER_EMAIL.toLowerCase()) {
    return USER_ROLES.COMMISSIONER;
  }
  return USER_ROLES.PLAYER;
}

function isCurrentUserCommissioner(email = currentUserEmail) {
  return getCurrentUserRole(email) === USER_ROLES.COMMISSIONER;
}

function updateLoggedInUserDisplay() {
  const loggedInEmail = document.getElementById('logged-in-email');
  if (!loggedInEmail) {
    return;
  }

  if (!currentUserEmail) {
    loggedInEmail.textContent = 'Not signed in';
    return;
  }

  const role = getCurrentUserRole();
  loggedInEmail.innerHTML = `${currentUserEmail}<br /><span class="logged-in-role">Role: ${role}</span>`;
}

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

const teamNameAliases = {
  Patriots: 'New England Patriots',
  'New England Patriots': 'New England Patriots',
  Seahawks: 'Seattle Seahawks',
  'Seattle Seahawks': 'Seattle Seahawks',
  '49ers': 'San Francisco 49ers',
  'San Francisco 49ers': 'San Francisco 49ers',
  Rams: 'Los Angeles Rams',
  'Los Angeles Rams': 'Los Angeles Rams',
  Saints: 'New Orleans Saints',
  'New Orleans Saints': 'New Orleans Saints',
  Lions: 'Detroit Lions',
  'Detroit Lions': 'Detroit Lions',
  Bills: 'Buffalo Bills',
  'Buffalo Bills': 'Buffalo Bills',
  Texans: 'Houston Texans',
  'Houston Texans': 'Houston Texans',
  Ravens: 'Baltimore Ravens',
  'Baltimore Ravens': 'Baltimore Ravens',
  Colts: 'Indianapolis Colts',
  'Indianapolis Colts': 'Indianapolis Colts',
  Bears: 'Chicago Bears',
  'Chicago Bears': 'Chicago Bears',
  Panthers: 'Carolina Panthers',
  'Carolina Panthers': 'Carolina Panthers',
  Buccaneers: 'Tampa Bay Buccaneers',
  'Tampa Bay Buccaneers': 'Tampa Bay Buccaneers',
  Bengals: 'Cincinnati Bengals',
  'Cincinnati Bengals': 'Cincinnati Bengals',
  Falcons: 'Atlanta Falcons',
  'Atlanta Falcons': 'Atlanta Falcons',
  Steelers: 'Pittsburgh Steelers',
  'Pittsburgh Steelers': 'Pittsburgh Steelers',
  Jets: 'New York Jets',
  'New York Jets': 'New York Jets',
  Titans: 'Tennessee Titans',
  'Tennessee Titans': 'Tennessee Titans',
  Browns: 'Cleveland Browns',
  'Cleveland Browns': 'Cleveland Browns',
  Jaguars: 'Jacksonville Jaguars',
  'Jacksonville Jaguars': 'Jacksonville Jaguars',
  Commanders: 'Washington Commanders',
  'Washington Commanders': 'Washington Commanders',
  Eagles: 'Philadelphia Eagles',
  'Philadelphia Eagles': 'Philadelphia Eagles',
  Cardinals: 'Arizona Cardinals',
  'Arizona Cardinals': 'Arizona Cardinals',
  Chargers: 'Los Angeles Chargers',
  'Los Angeles Chargers': 'Los Angeles Chargers',
  Dolphins: 'Miami Dolphins',
  'Miami Dolphins': 'Miami Dolphins',
  Raiders: 'Las Vegas Raiders',
  'Las Vegas Raiders': 'Las Vegas Raiders',
  Packers: 'Green Bay Packers',
  'Green Bay Packers': 'Green Bay Packers',
  Vikings: 'Minnesota Vikings',
  'Minnesota Vikings': 'Minnesota Vikings',
  Cowboys: 'Dallas Cowboys',
  'Dallas Cowboys': 'Dallas Cowboys',
  Giants: 'New York Giants',
  'New York Giants': 'New York Giants',
  Broncos: 'Denver Broncos',
  'Denver Broncos': 'Denver Broncos',
  Chiefs: 'Kansas City Chiefs',
  'Kansas City Chiefs': 'Kansas City Chiefs'
};

function normalizeTeamName(team) {
  if (!team || typeof team !== 'string') {
    return team;
  }
  return teamNameAliases[team] || team;
}

function getMatchupKey(matchup) {
  if (!matchup) {
    return null;
  }
  return [normalizeTeamName(matchup.away), normalizeTeamName(matchup.home)].sort().join('||');
}

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
  const currentWeek = getCurrentContestWeek(now);
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  siteStatusBar.textContent = `Week ${currentWeek} - ${dateFormatter.format(now)} • ${timeFormatter.format(now)}`;
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
  return 2;
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

function clearAllSavedPicks() {
  myPicks = [];
  superLocks = {};
  localStorage.removeItem('super7-picks');
  localStorage.removeItem('super7-super-locks');
  localStorage.removeItem('super7-standings-users');
  savePicks();
  saveSuperLocks();
  saveStandingsUsers([]);
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
    localStorage.removeItem('super7-test-scores');
  } catch {
    // ignore
  }
  return {};
}

function saveTestScores() {
  try {
    localStorage.removeItem('super7-test-scores');
  } catch {
    // ignore
  }
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

function getCurrentUserDisplayLabel() {
  return getDisplayName(currentUserEmail);
}

function setTestScore(week, away, home, awayScore, homeScore) {
  saveTestScores();
  return;
}

let testScores = loadTestScores();

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

function canEditPicksForWeek(week, email = currentUserEmail, playerId = 'me') {
  const weekNumber = Number(week);
  if (!Number.isFinite(weekNumber) || weekNumber < 1 || weekNumber > 18) {
    return false;
  }

  if (isCurrentUserCommissioner(email)) {
    return true;
  }

  return playerId === 'me';
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
  if (!matchup) {
    return {
      awayScore: null,
      homeScore: null,
      score: '',
      correct: false,
      push: false,
      hasResult: false
    };
  }

  const key = `${pick.week}|${matchup.away}@${matchup.home}`;
  const override = testScores && testScores[key];
  if (!override) {
    return {
      awayScore: null,
      homeScore: null,
      score: '',
      correct: false,
      push: false,
      hasResult: false
    };
  }

  const awayScore = Number(override.awayScore);
  const homeScore = Number(override.homeScore);
  const spread = Number(matchup.homeLine);
  const cover = pick.team === matchup.home ? homeScore - awayScore + spread : awayScore - homeScore - spread;
  const push = Math.abs(cover) < 0.5;
  const correct = !push && cover > 0;
  return {
    awayScore,
    homeScore,
    score: `${awayScore}-${homeScore}`,
    correct,
    push,
    hasResult: true
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

function normalizeSelectedTeamsForWeek(week, teams) {
  const matchups = contests.super7.weeks[week - 1]?.matchups || [];
  const cleaned = [];
  const matchupIndexByKey = new Map();

  teams.forEach((team) => {
    const normalizedTeam = normalizeTeamName(team);
    const matchup = matchups.find((item) => normalizeTeamName(item.away) === normalizedTeam || normalizeTeamName(item.home) === normalizedTeam);
    if (!matchup) {
      cleaned.push(normalizedTeam);
      return;
    }

    const matchupKey = getMatchupKey(matchup);
    if (matchupIndexByKey.has(matchupKey)) {
      const existingIndex = matchupIndexByKey.get(matchupKey);
      cleaned[existingIndex] = normalizedTeam;
      return;
    }

    matchupIndexByKey.set(matchupKey, cleaned.length);
    cleaned.push(normalizedTeam);
  });

  return cleaned;
}

function getMatchupForKey(week, matchupKey) {
  const matchups = contests.super7.weeks[week - 1]?.matchups || [];
  return matchups.find((matchup) => getMatchupKey(matchup) === matchupKey);
}

function updatePickedTeam(week, matchupIdentifier, team) {
  const matchup = typeof matchupIdentifier === 'string'
    ? getMatchupForKey(week, matchupIdentifier)
    : contests.super7.weeks[week - 1].matchups[matchupIdentifier];

  if (!matchup) {
    return;
  }

  const matchupTeams = [normalizeTeamName(matchup.away), normalizeTeamName(matchup.home)];
  const normalizedTeam = normalizeTeamName(team);

  selectedTeams = normalizeSelectedTeamsForWeek(week, selectedTeams);

  if (selectedTeams.includes(normalizedTeam)) {
    selectedTeams = selectedTeams.filter((item) => item !== normalizedTeam);
    if (selectedLock && !selectedTeams.includes(selectedLock)) {
      selectedLock = null;
    }
    return;
  }

  selectedTeams = selectedTeams.filter((item) => !matchupTeams.includes(normalizeTeamName(item)));

  if (selectedTeams.length >= 7) {
    showMessage('You must select exactly 7 games before saving.');
    return;
  }

  selectedTeams.push(normalizedTeam);
  if (selectedLock && !selectedTeams.includes(selectedLock)) {
    selectedLock = null;
  }
}

function saveWeekPicks(playerName = null) {
  selectedTeams = normalizeSelectedTeamsForWeek(selectedWeek, selectedTeams);
  const weekMatchups = contests.super7.weeks[selectedWeek - 1].matchups;
  if (selectedTeams.length !== 7) {
    showMessage('You must select exactly 7 games before saving.');
    return false;
  }

  if (!selectedLock || !selectedTeams.includes(selectedLock)) {
    showMessage('You must choose a Super Lock before saving.');
    return false;
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

  const targetName = playerName || getCurrentUserDisplayLabel();
  if (playerName && playerName !== getCurrentUserDisplayLabel()) {
    const standingsUsers = loadStandingsUsers();
    const userIndex = standingsUsers.findIndex((user) => user.name === targetName);
    const targetUser = userIndex >= 0 ? standingsUsers[userIndex] : { name: targetName, picks: [], superLocks: {} };
    targetUser.picks = (Array.isArray(targetUser.picks) ? targetUser.picks : []).filter((pick) => pick.week !== selectedWeek).concat(picksForWeek);
    targetUser.superLocks = targetUser.superLocks || {};
    if (selectedLock) {
      targetUser.superLocks[selectedWeek] = selectedLock;
    } else {
      delete targetUser.superLocks[selectedWeek];
    }
    if (userIndex >= 0) {
      standingsUsers[userIndex] = targetUser;
    } else {
      standingsUsers.push(targetUser);
    }
    saveStandingsUsers(standingsUsers);
    showMessage(`Saved ${selectedTeams.length} picks for ${targetName} in Week ${selectedWeek}.`);
    return true;
  }

  myPicks = myPicks.filter((pick) => pick.week !== selectedWeek).concat(picksForWeek);
  savePicks();

  if (selectedLock) {
    superLocks[selectedWeek] = selectedLock;
  } else {
    delete superLocks[selectedWeek];
  }
  saveSuperLocks();

  showMessage(`Saved ${selectedTeams.length} picks for Week ${selectedWeek}.`);
  return true;
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
      updateLoggedInUserDisplay();
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
      updateLoggedInUserDisplay();
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
        updateLoggedInUserDisplay();
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

  const currentWeek = getCurrentContestWeek();
  const currentWeekPicks = myPicks.filter((pick) => pick.week === currentWeek).length;

  pageBody.innerHTML = `
    <div class="contest-list">
      <div class="contest-card">
        <div class="contest-card-header">
          <h2>${contests.super7.name}</h2>
          <p>${contests.super7.description}</p>
          <p><strong>${currentWeekPicks}</strong> of 7 picks saved for Week ${currentWeek}.</p>
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
  const currentUserLabel = getCurrentUserDisplayLabel();
  const players = (() => {
    const list = [{ id: 'me', label: currentUserLabel || 'You', picks: myPicks, superLocks }];
    if (isCurrentUserCommissioner()) {
      const otherUsers = loadStandingsUsers().filter((user) => user.name !== currentUserLabel);
      otherUsers.forEach((user) => {
        list.push({
          id: user.name,
          label: user.name,
          picks: Array.isArray(user.picks) ? user.picks : [],
          superLocks: user.superLocks || {}
        });
      });
    }
    return list;
  })();

  const allAvailableWeeks = Array.from({ length: currentWeek }, (_, index) => index + 1).reverse();
  if (!Number.isFinite(selectedWeek) || selectedWeek < 1 || selectedWeek > currentWeek) {
    selectedWeek = currentWeek;
  }
  const activePlayer = players.find((player) => player.id === currentEditingPlayerName || player.label === currentEditingPlayerName) || players[0];
  const activeWeek = allAvailableWeeks.includes(Number(selectedWeek)) ? Number(selectedWeek) : currentWeek;
  selectedWeek = activeWeek;
  const selectedPlayerId = activePlayer.id;

  const weekData = activeWeek ? contest.weeks[activeWeek - 1] : null;
  const isEditableWeek = canEditPicksForWeek(activeWeek, currentUserEmail, activePlayer.id);
  pageTitle.textContent = contest.name;
  pageText.textContent = contest.description;
  const sortedMatchups = [...(weekData?.matchups || [])].sort((a, b) => {
    const left = getMatchupSortValue(a);
    const right = getMatchupSortValue(b);
    return left[0] - right[0] || left[1] - right[1] || left[2].localeCompare(right[2]);
  });

  pageBody.innerHTML = `
    <div class="contest-card picks-filter-card">
      <div class="picks-filter-bar">
        <div class="picks-filter-field">
          <label for="super7-week-select">Week</label>
          <select id="super7-week-select">
            ${allAvailableWeeks.map((week) => `
              <option value="${week}" ${week === activeWeek ? 'selected' : ''}>Week ${week}</option>
            `).join('')}
          </select>
        </div>
        <div class="picks-filter-field">
          <label for="super7-player-select">Player</label>
          <select id="super7-player-select">
            ${players.map((player) => `
              <option value="${player.id}" ${player.id === selectedPlayerId ? 'selected' : ''}>${player.label}</option>
            `).join('')}
          </select>
        </div>
      </div>
    </div>

    <div class="contest-card">
      <div class="contest-card-header">
        <h2>${contest.name}</h2>
      </div>
      ${activeWeek ? `
        <div class="contest-summary">
          <p>${isEditableWeek ? `Select games for week ${activeWeek}.` : `Week ${activeWeek} is locked for editing.`}</p>
          <p>${selectedTeams.length} game${selectedTeams.length === 1 ? '' : 's'} selected${selectedLock ? ', 1 super lock selected' : ', 0 super locks selected'}</p>
        </div>
        <div class="matchup-grid">
          ${sortedMatchups.map((matchup) => {
            const awayLine = invertLine(matchup.homeLine);
            const awaySelected = selectedTeams.includes(normalizeTeamName(matchup.away));
            const homeSelected = selectedTeams.includes(normalizeTeamName(matchup.home));
            const matchupKey = getMatchupKey(matchup);
            const matchupDay = matchup.day || 'TBD';
            const matchupTime = matchup.time || 'Time TBD';
            return `
              <div class="matchup-row">
                <div class="matchup-pick-row">
                  <button type="button" class="select-team-button${awaySelected ? ' selected' : ''}" data-matchup-key="${matchupKey}" data-team="${normalizeTeamName(matchup.away)}" data-away="${normalizeTeamName(matchup.away)}" data-home="${normalizeTeamName(matchup.home)}" data-home-line="${matchup.homeLine}">${matchup.away} ${awayLine}</button>
                  ${awaySelected ? `<button type="button" class="super-lock-toggle${selectedLock === normalizeTeamName(matchup.away) ? ' active' : ''}" data-team="${normalizeTeamName(matchup.away)}" aria-label="${selectedLock === normalizeTeamName(matchup.away) ? 'Remove Super Lock from' : 'Set'} ${matchup.away}">${selectedLock === normalizeTeamName(matchup.away) ? '🔒' : '🔓'}</button>` : ''}
                </div>
                <span class="matchup-vs">@</span>
                <div class="matchup-pick-row">
                  <button type="button" class="select-team-button home${homeSelected ? ' selected' : ''}" data-matchup-key="${matchupKey}" data-team="${normalizeTeamName(matchup.home)}" data-away="${normalizeTeamName(matchup.away)}" data-home="${normalizeTeamName(matchup.home)}" data-home-line="${matchup.homeLine}">${matchup.home} ${matchup.homeLine}</button>
                  ${homeSelected ? `<button type="button" class="super-lock-toggle${selectedLock === normalizeTeamName(matchup.home) ? ' active' : ''}" data-team="${normalizeTeamName(matchup.home)}" aria-label="${selectedLock === normalizeTeamName(matchup.home) ? 'Remove Super Lock from' : 'Set'} ${matchup.home}">${selectedLock === normalizeTeamName(matchup.home) ? '🔒' : '🔓'}</button>` : ''}
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

  const weekFilter = pageBody.querySelector('#super7-week-select');
  if (weekFilter) {
    weekFilter.addEventListener('change', function () {
      selectedWeek = Number(weekFilter.value);
      const player = players.find((entry) => entry.id === (currentEditingPlayerName || 'me')) || players[0];
      currentEditingPlayerName = player.label;
      selectedTeams = normalizeSelectedTeamsForWeek(selectedWeek, (player.picks || []).filter((pick) => pick.week === selectedWeek).map((pick) => pick.team));
      selectedLock = player.superLocks?.[selectedWeek] || null;
      renderSuper7Contest();
    });
  }

  const playerFilter = pageBody.querySelector('#super7-player-select');
  if (playerFilter) {
    playerFilter.addEventListener('change', function () {
      const chosenPlayerId = playerFilter.value;
      const player = players.find((entry) => entry.id === chosenPlayerId) || players[0];
      currentEditingPlayerName = chosenPlayerId === 'me' ? null : player.label;
      selectedWeek = Number(weekFilter?.value || selectedWeek || currentWeek);
      selectedTeams = normalizeSelectedTeamsForWeek(selectedWeek, (player.picks || []).filter((pick) => pick.week === selectedWeek).map((pick) => pick.team));
      selectedLock = player.superLocks?.[selectedWeek] || null;
      renderSuper7Contest();
    });
  }

  updateSiteStatusBar();

  pageBody.querySelectorAll('.select-team-button').forEach((button) => {
    button.addEventListener('click', function () {
      if (!isEditableWeek) {
        showPopupMessage(`Week ${selectedWeek} is locked and can't be edited.`);
        return;
      }
      const team = button.dataset.team;
      const matchupKey = button.dataset.matchupKey;
      updatePickedTeam(selectedWeek, matchupKey, team);
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
      const result = saveWeekPicks(currentEditingPlayerName);
      if (result === false) {
        showPopupMessage('Your picks are not valid yet. You must select exactly 7 games and choose one Super Lock before saving.');
        return;
      }
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
      if (currentEditingPlayerName) {
        const player = players.find((entry) => entry.id === currentEditingPlayerName || entry.label === currentEditingPlayerName) || players[0];
        if (player && player.superLocks) {
          delete player.superLocks[selectedWeek];
        }
      }
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

  const lastEditedPlayerName = currentEditingPlayerName;
  selectedContest = null;
  selectedWeek = 1;
  selectedTeam = null;
  currentEditingPlayerName = null;

  if (page === 'home') {
    renderHomePage();
  } else if (page === 'contests') {
    renderContestsPage();
  } else if (page === 'news') {
    renderNewsPage();
  } else if (page === 'myinfo' || page === 'about') {
    renderMyInfoPage();
  } else if (page === 'mypicks') {
    renderMyPicksPage(isCurrentUserCommissioner() && lastEditedPlayerName ? lastEditedPlayerName : 'me');
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

function renderMyPicksPage(selectedPlayerId = 'me', selectedWeekValue = 2) {
  pageTitle.textContent = 'My Picks';
  pageText.textContent = 'Your saved Super 7 selections.';
  updateSiteStatusBar();

  const currentWeek = 2;
  const visibleWeeks = Array.from({ length: currentWeek }, (_, index) => index + 1).reverse();
  const currentUserLabel = getCurrentUserDisplayLabel();
  const players = (() => {
    const list = [{ id: 'me', label: currentUserLabel || 'You', picks: myPicks, superLocks }];
    if (isCurrentUserCommissioner()) {
      const otherUsers = loadStandingsUsers().filter((user) => user.name !== currentUserLabel);
      otherUsers.forEach((user) => {
        list.push({
          id: user.name,
          label: user.name,
          picks: Array.isArray(user.picks) ? user.picks : [],
          superLocks: user.superLocks || {}
        });
      });
    }
    return list;
  })();

  const activePlayer = players.find((player) => player.id === selectedPlayerId) || players[0];
  const activeWeek = visibleWeeks.includes(Number(selectedWeekValue)) ? Number(selectedWeekValue) : currentWeek;
  const playerPicks = (activePlayer.picks || []).sort((a, b) => a.week - b.week);
  const picksByWeek = playerPicks.reduce((groups, pick) => {
    if (!groups[pick.week]) groups[pick.week] = [];
    groups[pick.week].push(pick);
    return groups;
  }, {});
  const weekPicks = picksByWeek[activeWeek] || [];
  const lock = activePlayer.superLocks?.[activeWeek];
  const isCurrentPlayerView = activePlayer.id === 'me';
  const canEditSelectedWeek = canEditPicksForWeek(activeWeek, currentUserEmail, activePlayer.id) && (isCurrentPlayerView || isCurrentUserCommissioner());

  if (!visibleWeeks.length) {
    pageBody.innerHTML = '<p>You have not saved any picks yet. Go to Contests to join Super 7 and save selections.</p>';
    return;
  }

  pageBody.innerHTML = `
    <div class="contest-card picks-filter-card">
      <div class="picks-filter-bar">
        <div class="picks-filter-field">
          <label for="picks-week-select">Week</label>
          <select id="picks-week-select">
            ${visibleWeeks.map((week) => `
              <option value="${week}" ${week === activeWeek ? 'selected' : ''}>Week ${week}</option>
            `).join('')}
          </select>
        </div>
        <div class="picks-filter-field">
          <label for="picks-player-select">Player</label>
          <select id="picks-player-select">
            ${players.map((player) => `
              <option value="${player.id}" ${player.id === activePlayer.id ? 'selected' : ''}>${player.label}</option>
            `).join('')}
          </select>
        </div>
      </div>
    </div>

    <div class="contest-card picks-results-card">
      ${canEditSelectedWeek ? `<button type="button" class="secondary-button edit-week-picks-button" data-week="${activeWeek}">Edit Picks</button>` : ''}
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
                  if (outcome.hasResult) {
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
                  }
                  const pickedAbbrev = teamAbbreviations[pick.team] || pick.team;
                  const opponentAbbrev = teamAbbreviations[opponent] || opponent;
                  const spreadDisplay = `(${pick.line})`;
                  const firstLine = outcome.hasResult
                    ? (pick.team === pick.home
                        ? `${pickedAbbrev} ${spreadDisplay} ${outcome.homeScore}`
                        : `${pickedAbbrev} ${spreadDisplay} ${outcome.awayScore}`)
                    : '—';
                  const secondLine = outcome.hasResult
                    ? (pick.team === pick.home
                        ? `${opponentAbbrev} ${outcome.awayScore}`
                        : `${opponentAbbrev} ${outcome.homeScore}`)
                    : '—';
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
  `;

  const weekFilter = pageBody.querySelector('#picks-week-select');
  if (weekFilter) {
    weekFilter.addEventListener('change', function () {
      renderMyPicksPage(activePlayer.id, Number(weekFilter.value));
    });
  }

  const playerFilter = pageBody.querySelector('#picks-player-select');
  if (playerFilter) {
    playerFilter.addEventListener('change', function () {
      currentEditingPlayerName = null;
      renderMyPicksPage(playerFilter.value, activeWeek);
    });
  }

  const editButton = pageBody.querySelector('.edit-week-picks-button');
  if (editButton) {
    editButton.addEventListener('click', function () {
      const week = Number(editButton.dataset.week);
      if (!canEditPicksForWeek(week, currentUserEmail, activePlayer.id)) {
        showMessage('You do not have permission to edit these picks.');
        return;
      }

      selectedWeek = week;
      selectedTeams = normalizeSelectedTeamsForWeek(week, (activePlayer.picks || []).filter((pick) => pick.week === week).map((pick) => pick.team));
      selectedLock = activePlayer.superLocks?.[week] || null;
      currentEditingPlayerName = isCurrentUserCommissioner() && !isCurrentPlayerView ? activePlayer.label : null;
      selectedContest = contests.super7.id;
      renderSuper7Contest();
    });
  }
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
  updateLoggedInUserDisplay();

  if (hasSavedPicksForCurrentWeek()) {
    currentPage = 'mypicks';
  }

  selectPage(currentPage);
}
