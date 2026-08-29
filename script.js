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
let selectedWeek = 1;
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

const weekZeroWinTotals = [
  { team: 'Arizona Cardinals', winTotal: 3.5 },
  { team: 'Atlanta Falcons', winTotal: 7.5 },
  { team: 'Baltimore Ravens', winTotal: 11.5 },
  { team: 'Buffalo Bills', winTotal: 10.5 },
  { team: 'Carolina Panthers', winTotal: 7.5 },
  { team: 'Chicago Bears', winTotal: 9.5 },
  { team: 'Cincinnati Bengals', winTotal: 10.5 },
  { team: 'Cleveland Browns', winTotal: 5.5 },
  { team: 'Dallas Cowboys', winTotal: 9.5 },
  { team: 'Denver Broncos', winTotal: 9.5 },
  { team: 'Detroit Lions', winTotal: 10.5 },
  { team: 'Green Bay Packers', winTotal: 9.5 },
  { team: 'Houston Texans', winTotal: 9.5 },
  { team: 'Indianapolis Colts', winTotal: 7.5 },
  { team: 'Jacksonville Jaguars', winTotal: 8.5 },
  { team: 'Kansas City Chiefs', winTotal: 10.5 },
  { team: 'Las Vegas Raiders', winTotal: 5.5 },
  { team: 'Los Angeles Chargers', winTotal: 9.5 },
  { team: 'Los Angeles Rams', winTotal: 11.5 },
  { team: 'Miami Dolphins', winTotal: 3.5 },
  { team: 'Minnesota Vikings', winTotal: 8.5 },
  { team: 'New England Patriots', winTotal: 10 },
  { team: 'New Orleans Saints', winTotal: 7.5 },
  { team: 'New York Giants', winTotal: 7.5 },
  { team: 'New York Jets', winTotal: 5.5 },
  { team: 'Philadelphia Eagles', winTotal: 11.5 },
  { team: 'Pittsburgh Steelers', winTotal: 8.5 },
  { team: 'San Francisco 49ers', winTotal: 9.5 },
  { team: 'Seattle Seahawks', winTotal: 10.5 },
  { team: 'Tampa Bay Buccaneers', winTotal: 8.5 },
  { team: 'Tennessee Titans', winTotal: 6.5 },
  { team: 'Washington Commanders', winTotal: 7.5 }
];

function isWeekZero(week) {
  return Number(week) === 0;
}

function getWeekData(week) {
  const weekNumber = Number(week);
  if (!Number.isFinite(weekNumber)) {
    return null;
  }
  return contests.super7.weeks.find((entry) => entry.week === weekNumber) || null;
}

function getWeekZeroSelectionKey(team, choice) {
  return `${normalizeTeamName(team)}::${choice}`;
}

function parseWeekZeroSelectionKey(selectionKey) {
  if (!selectionKey || typeof selectionKey !== 'string' || !selectionKey.includes('::')) {
    return null;
  }
  const [team, choice] = selectionKey.split('::');
  if (!team || (choice !== 'under' && choice !== 'over')) {
    return null;
  }
  return {
    team: normalizeTeamName(team),
    choice
  };
}

function getPickSelectionKey(pick) {
  if (isWeekZero(pick?.week) && (pick?.choice === 'under' || pick?.choice === 'over')) {
    return getWeekZeroSelectionKey(pick.team, pick.choice);
  }
  return normalizeTeamName(pick?.team);
}

function normalizeSelectedLockForWeek(week, lockValue, selections) {
  if (!lockValue) {
    return null;
  }

  if (!isWeekZero(week)) {
    const normalizedLock = normalizeTeamName(lockValue);
    return selections.includes(normalizedLock) ? normalizedLock : null;
  }

  if (selections.includes(lockValue)) {
    return lockValue;
  }

  const normalizedLockTeam = normalizeTeamName(lockValue);
  const inferred = selections.find((selectionKey) => {
    const parsed = parseWeekZeroSelectionKey(selectionKey);
    return parsed && parsed.team === normalizedLockTeam;
  });
  return inferred || null;
}

function getWeekZeroChoiceForTeam(team, selections = selectedTeams) {
  const normalizedTeam = normalizeTeamName(team);
  for (const selectionKey of selections) {
    const parsed = parseWeekZeroSelectionKey(selectionKey);
    if (parsed && parsed.team === normalizedTeam) {
      return parsed.choice;
    }
  }
  return null;
}

function formatLockLabel(week, lockValue) {
  if (!lockValue) {
    return '';
  }
  if (!isWeekZero(week)) {
    return lockValue;
  }

  const parsed = parseWeekZeroSelectionKey(lockValue);
  if (!parsed) {
    return lockValue;
  }
  return `${parsed.team} ${parsed.choice.toUpperCase()}`;
}

const week1Matchups = [
  { away: 'New England Patriots', home: 'Seattle Seahawks', homeLine: '-3.5', day: 'Wed', date: '9/9', time: '7:20 PM CT', notes: 'Wednesday Night Kickoff' },
  { away: 'San Francisco 49ers', home: 'Los Angeles Rams', homeLine: '-3.5', day: 'Thu', date: '9/10', time: '7:35 PM CT', notes: 'Game in Melbourne, AUS' },
  { away: 'Cleveland Browns', home: 'Jacksonville Jaguars', homeLine: '-8', day: 'Sun', date: '9/13', time: '12:00 PM CT' },
  { away: 'Tampa Bay Buccaneers', home: 'Cincinnati Bengals', homeLine: '-3.5', day: 'Sun', date: '9/13', time: '12:00 PM CT' },
  { away: 'Baltimore Ravens', home: 'Indianapolis Colts', homeLine: '+3.5', day: 'Sun', date: '9/13', time: '12:00 PM CT' },
  { away: 'Atlanta Falcons', home: 'Pittsburgh Steelers', homeLine: '-3.5', day: 'Sun', date: '9/13', time: '12:00 PM CT' },
  { away: 'Buffalo Bills', home: 'Houston Texans', homeLine: '+0.5', day: 'Sun', date: '9/13', time: '12:00 PM CT' },
  { away: 'Chicago Bears', home: 'Carolina Panthers', homeLine: '-2.5', day: 'Sun', date: '9/13', time: '12:00 PM CT' },
  { away: 'New York Jets', home: 'Tennessee Titans', homeLine: '-2.5', day: 'Sun', date: '9/13', time: '12:00 PM CT' },
  { away: 'New Orleans Saints', home: 'Detroit Lions', homeLine: '-7', day: 'Sun', date: '9/13', time: '12:00 PM CT' },
  { away: 'Arizona Cardinals', home: 'Los Angeles Chargers', homeLine: '-10.5', day: 'Sun', date: '9/13', time: '3:25 PM CT' },
  { away: 'Miami Dolphins', home: 'Las Vegas Raiders', homeLine: '-3.5', day: 'Sun', date: '9/13', time: '3:25 PM CT' },
  { away: 'Washington Commanders', home: 'Philadelphia Eagles', homeLine: '-4.5', day: 'Sun', date: '9/13', time: '3:25 PM CT' },
  { away: 'Green Bay Packers', home: 'Minnesota Vikings', homeLine: '-1', day: 'Sun', date: '9/13', time: '3:25 PM CT' },
  { away: 'Dallas Cowboys', home: 'New York Giants', homeLine: '-2.5', day: 'Sun', date: '9/13', time: '7:20 PM CT' },
  { away: 'Denver Broncos', home: 'Kansas City Chiefs', homeLine: 'OFF', day: 'Mon', date: '9/14', time: '7:15 PM CT', notes: 'Waiting on Mahomes Status' }
];

function formatSpread(value) {
  const formatted = value.toFixed(1).replace('.0', '');
  return value >= 0 ? `+${formatted}` : `${formatted}`;
}

function invertLine(line) {
  if (line === 'OFF') {
    return 'OFF';
  }
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
  const dayOrder = { Wed: 1, Thu: 2, Fri: 3, Sat: 4, Sun: 5, Mon: 6, Tue: 7 };
  const dayValue = dayOrder[matchup.day] ?? 99;
  const timeValue = matchup.time || '00:00 PM CT';
  const numericTime = Number(timeValue.replace(/[^\d]/g, '').slice(0, 4)) || 0;
  return [dayValue, numericTime, timeValue];
}

function parseClockTime(timeLabel) {
  const match = String(timeLabel || '').match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (!match) {
    return null;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2] || 0);
  const meridiem = match[3].toUpperCase();

  if (meridiem === 'PM' && hours < 12) {
    hours += 12;
  }
  if (meridiem === 'AM' && hours === 12) {
    hours = 0;
  }

  return { hours, minutes };
}

function getTimeZoneOffsetMinutes(date, timeZone) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const parts = formatter.formatToParts(date).reduce((acc, part) => {
    if (part.type !== 'literal') {
      acc[part.type] = part.value;
    }
    return acc;
  }, {});

  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );

  return (asUtc - date.getTime()) / 60000;
}

function createDateFromTimeZoneWallClock(year, month, day, hour, minute, timeZone) {
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const offsetMinutes = getTimeZoneOffsetMinutes(utcGuess, timeZone);
  return new Date(utcGuess.getTime() - offsetMinutes * 60000);
}

function getMatchupDateLabel(matchup, week) {
  if (matchup?.date) {
    return matchup.date;
  }

  const kickoff = getMatchupKickoffDate(matchup, week);
  const month = kickoff.getMonth() + 1;
  const day = kickoff.getDate();
  return `${month}/${day}`;
}

function getLocalKickoffLabel(matchup, week) {
  if (!matchup?.time || matchup.time === 'TBD') {
    const fallbackDate = getMatchupDateLabel(matchup, week);
    return `${matchup.day || 'TBD'} ${fallbackDate} • Time TBD`;
  }

  const parsedTime = parseClockTime(matchup.time);
  if (!parsedTime) {
    const fallbackDate = getMatchupDateLabel(matchup, week);
    return `${matchup.day || 'TBD'} ${fallbackDate} • ${matchup.time}`;
  }

  const dateLabel = getMatchupDateLabel(matchup, week);
  const [monthString, dayString] = String(dateLabel).split('/');
  const month = Number(monthString);
  const day = Number(dayString);
  const year = new Date().getFullYear();

  if (!Number.isFinite(month) || !Number.isFinite(day)) {
    return `${matchup.day || 'TBD'} ${dateLabel} • ${matchup.time}`;
  }

  const kickoffInstant = createDateFromTimeZoneWallClock(
    year,
    month,
    day,
    parsedTime.hours,
    parsedTime.minutes,
    'America/Chicago'
  );

  const localDate = new Intl.DateTimeFormat(undefined, {
    month: 'numeric',
    day: 'numeric'
  }).format(kickoffInstant);

  const localTime = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short'
  }).format(kickoffInstant);

  return `${matchup.day || 'TBD'} ${localDate} • ${localTime}`;
}

function getCurrentContestWeek(date = new Date()) {
  return 1;
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
      email: currentUserEmail,
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

async function refreshStandingsUsersFromServer() {
  if (!currentUserEmail) {
    return loadStandingsUsers();
  }

  try {
    const response = await fetch('/api/standings-users', { credentials: 'same-origin' });
    if (!response.ok) {
      return loadStandingsUsers();
    }

    const payload = await response.json();
    const users = Array.isArray(payload.users) ? payload.users : [];
    saveStandingsUsers(users);
    return users;
  } catch {
    return loadStandingsUsers();
  }
}

async function syncCurrentUserStandingsRowToServer() {
  if (!currentUserEmail) {
    return;
  }

  try {
    await fetch('/api/standings-me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({
        displayName: getCurrentUserDisplayLabel(),
        picks: myPicks,
        superLocks: superLocks
      })
    });
  } catch {
    // ignore network sync errors; local state remains usable
  }
}

function pruneStandingsProfilesToOwner(keepEmail = COMMISSIONER_EMAIL) {
  const keepEmailNormalized = (keepEmail || '').trim().toLowerCase();
  if (!keepEmailNormalized) {
    return;
  }

  const standingsUsers = loadStandingsUsers();
  const ownerDisplayName = getDisplayName(keepEmail).trim();
  const ownerDisplayNameNormalized = ownerDisplayName.toLowerCase();

  const matchingProfiles = standingsUsers.filter((user) => {
    const userEmailNormalized = (user.email || '').trim().toLowerCase();
    const userNameNormalized = (user.name || '').trim().toLowerCase();
    return userEmailNormalized === keepEmailNormalized
      || userNameNormalized === keepEmailNormalized
      || userNameNormalized === ownerDisplayNameNormalized;
  });

  const sourceProfile = matchingProfiles[0] || {};
  const isOwnerSession = (currentUserEmail || '').trim().toLowerCase() === keepEmailNormalized;
  const ownerRecord = {
    ...sourceProfile,
    email: keepEmail,
    name: ownerDisplayName || keepEmail,
    picks: isOwnerSession ? myPicks : (Array.isArray(sourceProfile.picks) ? sourceProfile.picks : []),
    superLocks: isOwnerSession ? superLocks : (sourceProfile.superLocks || {}),
    paid: Boolean(sourceProfile.paid)
  };

  saveStandingsUsers([ownerRecord]);
}

function syncCurrentUserStandingsRow() {
  const standingsUsers = loadStandingsUsers();
  const currentUserName = getCurrentUserDisplayLabel();
  const currentUserEmailNormalized = (currentUserEmail || '').trim().toLowerCase();
  const currentUserNameNormalized = (currentUserName || '').trim().toLowerCase();
  const livePicksJson = JSON.stringify(myPicks);
  const liveSuperLocksJson = JSON.stringify(superLocks);

  const matchingIndices = standingsUsers
    .map((user, index) => {
      const userNameNormalized = (user.name || '').trim().toLowerCase();
      const userEmailNormalized = (user.email || '').trim().toLowerCase();
      const userPicksJson = JSON.stringify(Array.isArray(user.picks) ? user.picks : []);
      const userSuperLocksJson = JSON.stringify(user.superLocks || {});
      const matchesIdentity = userEmailNormalized === currentUserEmailNormalized || userNameNormalized === currentUserNameNormalized;
      const matchesLiveState = userPicksJson === livePicksJson && userSuperLocksJson === liveSuperLocksJson;
      return matchesIdentity || matchesLiveState ? index : -1;
    })
    .filter((index) => index >= 0);

  const currentUserIndex = matchingIndices[0] ?? -1;

  const currentUserRecord = {
    email: currentUserEmail,
    name: currentUserName,
    picks: myPicks,
    superLocks: superLocks,
    paid: Boolean(currentUserIndex >= 0 ? standingsUsers[currentUserIndex].paid : false)
  };

  const updatedStandingsUsers = standingsUsers.filter((_, index) => !matchingIndices.includes(index));
  updatedStandingsUsers.unshift(currentUserRecord);
  saveStandingsUsers(updatedStandingsUsers);
  syncCurrentUserStandingsRowToServer();
}

async function setPaidStatusForStandingsUser(userName, isPaid) {
  const standingsUsers = loadStandingsUsers();
  const userIndex = standingsUsers.findIndex((user) => user.name === userName);
  if (userIndex < 0) {
    return;
  }

  const userEmail = standingsUsers[userIndex].email;
  if (userEmail) {
    try {
      const response = await fetch('/api/standings-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email: userEmail, isPaid })
      });
      if (response.ok) {
        await refreshStandingsUsersFromServer();
        return;
      }
    } catch {
      // fall through to local fallback
    }
  }

  standingsUsers[userIndex] = {
    ...standingsUsers[userIndex],
    paid: Boolean(isPaid)
  };
  saveStandingsUsers(standingsUsers);
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
    return 0;
  }
  return myPicks.reduce((latest, pick) => Math.max(latest, pick.week), 0);
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
  if (!Number.isFinite(weekNumber) || weekNumber < 0 || weekNumber > 18) {
    return false;
  }

  if (isCurrentUserCommissioner(email)) {
    return true;
  }

  return playerId === 'me';
}

function getMatchupForPick(pick) {
  const weekData = getWeekData(pick.week);
  if (!weekData) {
    return null;
  }

  if (isWeekZero(pick.week)) {
    return weekData.winTotals?.find((entry) => normalizeTeamName(entry.team) === normalizeTeamName(pick.team)) || null;
  }

  return weekData.matchups?.find(
    (matchup) =>
      (matchup.home === pick.home && matchup.away === pick.away) ||
      (matchup.home === pick.away && matchup.away === pick.home)
  ) || null;
}

function generateActualScore(week, matchup) {
  const seed = [...matchup.away, ...matchup.home].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) + week * 13;
  const awayScore = 14 + (seed % 17);
  const desiredMargin = Number(matchup.homeLine);
  const homeScore = Math.max(awayScore - 7, Math.min(awayScore + 14, awayScore + Math.round(desiredMargin + ((seed % 9) - 4))));
  return { awayScore, homeScore };
}

function getPickOutcome(pick, matchup) {
  if (isWeekZero(pick?.week)) {
    return {
      awayScore: null,
      homeScore: null,
      score: '',
      correct: false,
      push: false,
      hasResult: false
    };
  }

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
  const currentUserName = getCurrentUserDisplayLabel();
  const currentUserEmailNormalized = (currentUserEmail || '').trim().toLowerCase();
  const currentUserNameNormalized = (currentUserName || '').trim().toLowerCase();
  const standingsUsers = loadStandingsUsers().map((user) => {
    const userNameNormalized = (user.name || '').trim().toLowerCase();
    if (userNameNormalized !== currentUserNameNormalized && userNameNormalized !== currentUserEmailNormalized) {
      return user;
    }

    return {
      ...user,
      picks: myPicks,
      superLocks: superLocks
    };
  });
  const currentWeek = getCurrentContestWeek();
  const standings = standingsUsers.map((user) => {
    const userPicks = Array.isArray(user.picks) ? user.picks : [];
    const userSuperLocks = user.superLocks || {};
    const currentWeekPicks = userPicks.filter((pick) => Number(pick.week) === Number(currentWeek));
    const hasWeeklyPicksMade = currentWeekPicks.length >= 7 && Boolean(userSuperLocks[currentWeek]);
    const isPaid = Boolean(user.paid);
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
      if (!outcome.hasResult) {
        return;
      }
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
      isPaid,
      paidStatus: isPaid
        ? '<span class="result-mark correct" title="Paid">✅</span>'
        : '<span class="result-mark incorrect" title="Not paid">❌</span>',
      weeklyPicksMade: hasWeeklyPicksMade
        ? '<span class="result-mark correct" title="Weekly picks made">✅</span>'
        : '<span class="result-mark incorrect" title="Weekly picks not complete">❌</span>',
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
  if (isWeekZero(week)) {
    const latestSelectionByTeam = new Map();

    teams.forEach((selectionKey) => {
      const parsed = parseWeekZeroSelectionKey(selectionKey);
      if (!parsed) {
        return;
      }
      latestSelectionByTeam.set(parsed.team, getWeekZeroSelectionKey(parsed.team, parsed.choice));
    });

    return Array.from(latestSelectionByTeam.values());
  }

  const matchups = getWeekData(week)?.matchups || [];
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
  const matchups = getWeekData(week)?.matchups || [];
  return matchups.find((matchup) => getMatchupKey(matchup) === matchupKey);
}

function updatePickedTeam(week, matchupIdentifier, team) {
  const matchup = typeof matchupIdentifier === 'string'
    ? getMatchupForKey(week, matchupIdentifier)
    : getWeekData(week)?.matchups?.[matchupIdentifier];

  if (!matchup) {
    return;
  }

  if (matchup.homeLine === 'OFF') {
    showMessage('This game is OFF and cannot be selected yet.');
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

function updateWeekZeroPickedTeam(week, team, choice) {
  const normalizedTeam = normalizeTeamName(team);
  const selectionKey = getWeekZeroSelectionKey(normalizedTeam, choice);
  selectedTeams = normalizeSelectedTeamsForWeek(week, selectedTeams);

  const existingSelectionKey = selectedTeams.find((item) => {
    const parsed = parseWeekZeroSelectionKey(item);
    return parsed && parsed.team === normalizedTeam;
  });

  if (existingSelectionKey === selectionKey) {
    selectedTeams = selectedTeams.filter((item) => item !== selectionKey);
    if (selectedLock && !selectedTeams.includes(selectedLock)) {
      selectedLock = null;
    }
    return;
  }

  if (!existingSelectionKey && selectedTeams.length >= 7) {
    showMessage('You must select exactly 7 games before saving.');
    return;
  }

  selectedTeams = selectedTeams.filter((item) => {
    const parsed = parseWeekZeroSelectionKey(item);
    return !(parsed && parsed.team === normalizedTeam);
  });

  selectedTeams.push(selectionKey);
  if (selectedLock && !selectedTeams.includes(selectedLock)) {
    selectedLock = null;
  }
}

function saveWeekPicks(playerName = null) {
  selectedTeams = normalizeSelectedTeamsForWeek(selectedWeek, selectedTeams);
  const weekData = getWeekData(selectedWeek);
  if (!weekData) {
    showMessage('Unable to save picks for this week.');
    return false;
  }

  if (!isWeekZero(selectedWeek)) {
    const offTeams = new Set(
      (weekData.matchups || [])
        .filter((matchup) => matchup.homeLine === 'OFF')
        .flatMap((matchup) => [normalizeTeamName(matchup.away), normalizeTeamName(matchup.home)])
    );
    selectedTeams = selectedTeams.filter((team) => !offTeams.has(normalizeTeamName(team)));
    if (selectedLock && offTeams.has(normalizeTeamName(selectedLock))) {
      selectedLock = null;
    }
  }

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

  const picksForWeek = isWeekZero(selectedWeek)
    ? selectedTeams
      .map((selectionKey) => {
        const parsed = parseWeekZeroSelectionKey(selectionKey);
        if (!parsed) {
          return null;
        }
        const teamEntry = weekData.winTotals?.find((entry) => normalizeTeamName(entry.team) === parsed.team);
        if (!teamEntry) {
          return null;
        }

        return {
          week: selectedWeek,
          team: parsed.team,
          choice: parsed.choice,
          line: String(teamEntry.winTotal),
          matchup: `${parsed.team} Win Total ${teamEntry.winTotal}`,
          awayScore: null,
          homeScore: null,
          score: '',
          correct: false,
          push: false
        };
      })
      .filter(Boolean)
    : selectedTeams.map((team) => {
      const matchup = weekData.matchups.find((m) => m.away === team || m.home === team);
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
  syncCurrentUserStandingsRow();

  showMessage(`Saved ${selectedTeams.length} picks for Week ${selectedWeek}.`);
  return true;
}

function generateWeekMatchups(week) {
  if (week === 1) {
    return week1Matchups;
  }

  const adjustment = ((week - 1) % 7 - 3) * 0.5;
  const matchupTimes = ['1:00 PM CT', '4:05 PM CT', '4:25 PM CT', '8:20 PM CT'];
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
    description: 'Pick seven teams each week. Week 0 uses season win totals (over/under), and Weeks 1-18 use game spreads.',
    weeks: [
      {
        week: 0,
        winTotals: weekZeroWinTotals.map((entry) => ({ ...entry }))
      },
      ...Array.from({ length: 18 }, (_, index) => ({
        week: index + 1,
        matchups: generateWeekMatchups(index + 1)
      }))
    ]
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
      syncCurrentUserStandingsRow();
      updateLoggedInUserDisplay();
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

  const allAvailableWeeks = Array.from({ length: 19 }, (_, index) => index);
  if (!Number.isFinite(selectedWeek) || selectedWeek < 0 || selectedWeek > 18) {
    selectedWeek = currentWeek;
  }
  const activePlayer = players.find((player) => player.id === currentEditingPlayerName || player.label === currentEditingPlayerName) || players[0];
  const activeWeek = allAvailableWeeks.includes(Number(selectedWeek)) ? Number(selectedWeek) : currentWeek;
  selectedWeek = activeWeek;
  const selectedPlayerId = activePlayer.id;

  const weekData = getWeekData(activeWeek);
  const isWeekZeroMode = isWeekZero(activeWeek);
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
      ${weekData ? `
        <div class="contest-summary">
          <p>${isEditableWeek ? `Select games for week ${activeWeek}.` : `Week ${activeWeek} is locked for editing.`}</p>
          <p>${selectedTeams.length} game${selectedTeams.length === 1 ? '' : 's'} selected${selectedLock ? `, super lock: ${formatLockLabel(activeWeek, selectedLock)}` : ', 0 super locks selected'}</p>
        </div>
        ${isWeekZeroMode ? `
          <div class="week-zero-grid">
            ${(weekData?.winTotals || []).map((entry) => {
              const normalizedTeam = normalizeTeamName(entry.team);
              const underKey = getWeekZeroSelectionKey(normalizedTeam, 'under');
              const overKey = getWeekZeroSelectionKey(normalizedTeam, 'over');
              const selectedChoice = getWeekZeroChoiceForTeam(normalizedTeam);
              const underSelected = selectedChoice === 'under';
              const overSelected = selectedChoice === 'over';
              const selectedKey = underSelected ? underKey : overSelected ? overKey : null;
              return `
                <div class="week-zero-row">
                  <div class="week-zero-side week-zero-side-under">
                    <button type="button" class="select-team-button week-zero-under${underSelected ? ' selected' : ''}" data-team="${normalizedTeam}" data-choice="under">Under</button>
                    ${underSelected ? `<button type="button" class="super-lock-toggle week-zero-lock-toggle${selectedLock === underKey ? ' active' : ''}" data-selection-key="${underKey}" aria-label="${selectedLock === underKey ? 'Remove Super Lock from' : 'Set Super Lock on'} ${entry.team} under">${selectedLock === underKey ? '🔒' : '🔓'}</button>` : ''}
                  </div>
                  <div class="week-zero-team-line">
                    <strong>${entry.team}</strong>
                    <span>${entry.winTotal} wins</span>
                  </div>
                  <div class="week-zero-side week-zero-side-over">
                    <button type="button" class="select-team-button week-zero-over${overSelected ? ' selected' : ''}" data-team="${normalizedTeam}" data-choice="over">Over</button>
                    ${overSelected ? `<button type="button" class="super-lock-toggle week-zero-lock-toggle${selectedLock === overKey ? ' active' : ''}" data-selection-key="${overKey}" aria-label="${selectedLock === overKey ? 'Remove Super Lock from' : 'Set Super Lock on'} ${entry.team} over">${selectedLock === overKey ? '🔒' : '🔓'}</button>` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <div class="matchup-grid">
            ${sortedMatchups.map((matchup) => {
              const awayLine = invertLine(matchup.homeLine);
              const isOffLine = matchup.homeLine === 'OFF';
              const awaySelected = selectedTeams.includes(normalizeTeamName(matchup.away));
              const homeSelected = selectedTeams.includes(normalizeTeamName(matchup.home));
              const matchupKey = getMatchupKey(matchup);
              const matchupKickoffLabel = getLocalKickoffLabel(matchup, activeWeek);
              const matchupNotes = matchup.notes || '';
              return `
                <div class="matchup-row">
                  <div class="matchup-pick-row">
                    <button type="button" class="select-team-button${awaySelected ? ' selected' : ''}" data-matchup-key="${matchupKey}" data-team="${normalizeTeamName(matchup.away)}" data-away="${normalizeTeamName(matchup.away)}" data-home="${normalizeTeamName(matchup.home)}" data-home-line="${matchup.homeLine}" ${isOffLine ? 'disabled' : ''}>${matchup.away} ${awayLine}</button>
                    ${awaySelected && !isOffLine ? `<button type="button" class="super-lock-toggle${selectedLock === normalizeTeamName(matchup.away) ? ' active' : ''}" data-team="${normalizeTeamName(matchup.away)}" aria-label="${selectedLock === normalizeTeamName(matchup.away) ? 'Remove Super Lock from' : 'Set'} ${matchup.away}">${selectedLock === normalizeTeamName(matchup.away) ? '🔒' : '🔓'}</button>` : ''}
                  </div>
                  <span class="matchup-vs">@</span>
                  <div class="matchup-pick-row">
                    <button type="button" class="select-team-button home${homeSelected ? ' selected' : ''}" data-matchup-key="${matchupKey}" data-team="${normalizeTeamName(matchup.home)}" data-away="${normalizeTeamName(matchup.away)}" data-home="${normalizeTeamName(matchup.home)}" data-home-line="${matchup.homeLine}" ${isOffLine ? 'disabled' : ''}>${matchup.home} ${matchup.homeLine}</button>
                    ${homeSelected && !isOffLine ? `<button type="button" class="super-lock-toggle${selectedLock === normalizeTeamName(matchup.home) ? ' active' : ''}" data-team="${normalizeTeamName(matchup.home)}" aria-label="${selectedLock === normalizeTeamName(matchup.home) ? 'Remove Super Lock from' : 'Set'} ${matchup.home}">${selectedLock === normalizeTeamName(matchup.home) ? '🔒' : '🔓'}</button>` : ''}
                  </div>
                  <div class="matchup-time">${matchupKickoffLabel}</div>
                  ${matchupNotes ? `<div class="matchup-note">${matchupNotes}</div>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        `}
        ${isEditableWeek ? `
          <div class="selection-summary">
            ${selectedTeams.length ? `<p class="help-text">${selectedLock ? `Super Lock: ${formatLockLabel(activeWeek, selectedLock)}` : 'Tap the padlock next to a selected pick to mark it as your Super Lock.'}</p>` : '<p class="help-text">No teams selected yet.</p>'}
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
      selectedTeams = normalizeSelectedTeamsForWeek(selectedWeek, (player.picks || []).filter((pick) => pick.week === selectedWeek).map((pick) => getPickSelectionKey(pick)));
      selectedLock = normalizeSelectedLockForWeek(selectedWeek, player.superLocks?.[selectedWeek] || null, selectedTeams);
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
      selectedTeams = normalizeSelectedTeamsForWeek(selectedWeek, (player.picks || []).filter((pick) => pick.week === selectedWeek).map((pick) => getPickSelectionKey(pick)));
      selectedLock = normalizeSelectedLockForWeek(selectedWeek, player.superLocks?.[selectedWeek] || null, selectedTeams);
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
      const choice = button.dataset.choice;
      if (isWeekZeroMode && choice) {
        updateWeekZeroPickedTeam(selectedWeek, team, choice);
      } else {
        const matchupKey = button.dataset.matchupKey;
        updatePickedTeam(selectedWeek, matchupKey, team);
      }
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
      const lockValue = button.dataset.selectionKey || button.dataset.team;
      selectedLock = selectedLock === lockValue ? null : lockValue;
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

async function renderNewsPage() {
  pageTitle.textContent = 'Standings';
  pageText.textContent = 'Current contest standings for all players.';
  await refreshStandingsUsersFromServer();

  const standings = getStandingsRows();
  const isCommissioner = isCurrentUserCommissioner();
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
            <th>Paid</th>
            <th>Weekly Picks Made</th>
          </tr>
        </thead>
        <tbody>
          ${standings.map((row) => `
            <tr>
              <td>${row.name}</td>
              <td>${row.points}</td>
              <td>${row.pickRecord}</td>
              <td>${row.superLockRecord}</td>
              <td>
                ${isCommissioner
                  ? `<button type="button" class="paid-toggle-button result-mark ${row.isPaid ? 'correct' : 'incorrect'}" data-user-name="${row.name}" aria-label="Toggle paid status for ${row.name}">${row.isPaid ? '✅' : '❌'}</button>`
                  : row.paidStatus}
              </td>
              <td>${row.weeklyPicksMade}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  if (isCommissioner) {
    pageBody.querySelectorAll('.paid-toggle-button').forEach((button) => {
      button.addEventListener('click', async function () {
        const userName = button.dataset.userName;
        const standingsUsers = loadStandingsUsers();
        const user = standingsUsers.find((entry) => entry.name === userName);
        if (!user) {
          return;
        }

        await setPaidStatusForStandingsUser(userName, !user.paid);
        renderNewsPage();
      });
    });
  }
}

function canRevealPickForViewer(pick, { isCurrentPlayerView, isCommissioner, now = new Date() }) {
  if (isCurrentPlayerView || isCommissioner) {
    return true;
  }

  const pickWeek = Number(pick?.week);
  if (!Number.isFinite(pickWeek)) {
    return false;
  }

  if (isWeekZero(pickWeek)) {
    return true;
  }

  const currentWeek = Number(getCurrentContestWeek(now));
  if (pickWeek < currentWeek) {
    return true;
  }
  if (pickWeek > currentWeek) {
    return false;
  }

  const matchup = getMatchupForPick(pick);
  if (!matchup) {
    return false;
  }

  const kickoff = getMatchupKickoffDate(matchup, pickWeek);
  return now >= kickoff;
}

async function renderMyPicksPage(selectedPlayerId = 'me', selectedWeekValue = 1) {
  pageTitle.textContent = 'My Picks';
  pageText.textContent = 'Your saved Super 7 selections.';
  updateSiteStatusBar();
  await refreshStandingsUsersFromServer();

  const currentWeek = getCurrentContestWeek();
  const visibleWeeks = Array.from({ length: 19 }, (_, index) => index);
  const currentUserLabel = getCurrentUserDisplayLabel();
  const currentUserEmailNormalized = (currentUserEmail || '').trim().toLowerCase();
  const currentUserLabelNormalized = (currentUserLabel || '').trim().toLowerCase();
  const players = (() => {
    const list = [{ id: 'me', label: currentUserLabel || 'You', picks: myPicks, superLocks }];
    const otherUsers = loadStandingsUsers().filter((user) => {
      const userEmailNormalized = (user.email || '').trim().toLowerCase();
      const userNameNormalized = (user.name || '').trim().toLowerCase();
      if (userEmailNormalized) {
        return userEmailNormalized !== currentUserEmailNormalized;
      }
      return userNameNormalized !== currentUserLabelNormalized && userNameNormalized !== currentUserEmailNormalized;
    });

    otherUsers.forEach((user) => {
      list.push({
        id: user.email || user.name,
        label: user.name,
        picks: Array.isArray(user.picks) ? user.picks : [],
        superLocks: user.superLocks || {}
      });
    });
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
  const isCommissionerViewer = isCurrentUserCommissioner();
  const canEditSelectedWeek = canEditPicksForWeek(activeWeek, currentUserEmail, activePlayer.id) && (isCurrentPlayerView || isCommissionerViewer);
  const visibilityNow = new Date();

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
                  const canViewPick = canRevealPickForViewer(pick, {
                    isCurrentPlayerView,
                    isCommissioner: isCommissionerViewer,
                    now: visibilityNow
                  });

                  if (!canViewPick) {
                    return `
                      <tr>
                        <td><span class="help-text">Pick hidden until kickoff.</span></td>
                        <td class="stacked-score"><div>-</div><div>-</div></td>
                        <td>-</td>
                      </tr>
                    `;
                  }

                  const matchup = getMatchupForPick(pick);
                  const outcome = getPickOutcome(pick, matchup);
                  const opponent = pick.team === pick.home ? pick.away : pick.home;
                  const isWeekZeroPick = isWeekZero(pick.week);
                  const selectionKey = getPickSelectionKey(pick);
                  const isLockedPick = lock === selectionKey || (isWeekZeroPick && lock === normalizeTeamName(pick.team));
                  const pickText = isWeekZeroPick
                    ? `<strong class="pick-choice">${pick.team}</strong> ${pick.choice === 'under' ? 'UNDER' : 'OVER'} ${pick.line}`
                    : (pick.team === pick.home
                      ? `${opponent} @ <strong class="pick-choice">${pick.team} ${pick.line}</strong>`
                      : `<strong class="pick-choice">${pick.team} ${pick.line}</strong> @ ${opponent}`);
                  const lockText = isLockedPick ? ' <span class="pick-lock-label">(Super Lock)</span>' : '';
                  let resultMark = '';
                  if (outcome.hasResult && !isWeekZeroPick) {
                    if (outcome.push) {
                      resultMark = isLockedPick
                        ? '<span class="result-mark push">=</span><span class="result-mark push">=</span>'
                        : '<span class="result-mark push">=</span>';
                    } else if (isLockedPick) {
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
                  const firstLine = outcome.hasResult && !isWeekZeroPick
                    ? (pick.team === pick.home
                        ? `${pickedAbbrev} ${spreadDisplay} ${outcome.homeScore}`
                        : `${pickedAbbrev} ${spreadDisplay} ${outcome.awayScore}`)
                    : '—';
                  const secondLine = outcome.hasResult && !isWeekZeroPick
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
      selectedTeams = normalizeSelectedTeamsForWeek(week, (activePlayer.picks || []).filter((pick) => pick.week === week).map((pick) => getPickSelectionKey(pick)));
      selectedLock = normalizeSelectedLockForWeek(week, activePlayer.superLocks?.[week] || null, selectedTeams);
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
  syncCurrentUserStandingsRow();
  refreshStandingsUsersFromServer();

  if (hasSavedPicksForCurrentWeek()) {
    currentPage = 'mypicks';
  }

  selectPage(currentPage);
}
