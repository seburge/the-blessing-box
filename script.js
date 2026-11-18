const menu = document.querySelector('.menu-button');
const navigation = document.querySelector('#navigation');
if (menu && navigation) {
  menu.addEventListener('click', () => {
    const expanded = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', String(!expanded));
    navigation.classList.toggle('open', !expanded);
  });
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    menu.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('open');
  }));
}
const ideas = [
  'Leave a cheerful note for someone who could use a smile.',
  'Ask someone about their day, then give them your full attention.',
  'With an adult’s help, choose something useful to donate to a local animal shelter.',
  'Make a thank-you card for a teacher, librarian, or neighbor.',
  'Invite someone to join a game or a conversation.',
  'Offer to help with a household chore before anyone asks.',
  'Tell someone one thing you appreciate about them.'
];
let ideaIndex = 0;
const ideaButton = document.querySelector('#new-idea');
if (ideaButton) ideaButton.addEventListener('click', () => {
  ideaIndex = (ideaIndex + 1) % ideas.length;
  document.querySelector('#kindness-idea').textContent = ideas[ideaIndex];
});

// Keep the birth-year choices current, including after a new calendar year begins.
const birthYear = document.querySelector('#birth-year');
if (birthYear) {
  const currentYear = new Date().getFullYear();
  const yearOptions = document.createDocumentFragment();
  for (let year = currentYear; year >= 1900; year -= 1) {
    yearOptions.append(new Option(String(year), String(year)));
  }
  birthYear.querySelectorAll('option[value]:not([value=""])').forEach(option => option.remove());
  birthYear.append(yearOptions);
}

const adultAgeCheck = document.querySelector('#adult-age-check');
if (adultAgeCheck && birthYear) {
  const birthdayConfirmation = document.querySelector('#birthday-confirmation');
  const alreadyEighteen = document.querySelector('#already-eighteen');
  const adultContent = document.querySelector('#adult-content');
  birthYear.addEventListener('change', () => {
    const needsBirthday = Number(birthYear.value) === new Date().getFullYear() - 18;
    birthdayConfirmation.hidden = !needsBirthday;
    alreadyEighteen.checked = false;
    adultContent.hidden = true;
  });
  adultAgeCheck.addEventListener('submit', event => {
    event.preventDefault();
    if (!adultAgeCheck.reportValidity()) return;
    const ageThisYear = new Date().getFullYear() - Number(birthYear.value);
    if (ageThisYear < 18 || (ageThisYear === 18 && !alreadyEighteen.checked)) {
      window.location.assign('santas-big-helpers.html');
      return;
    }
    adultContent.hidden = false;
    const heading = adultContent.querySelector('h2');
    heading.setAttribute('tabindex', '-1');
    heading.focus();
  });
}

const snowfall = document.querySelector('.snowfall');
const snowToggle = document.querySelector('.snow-toggle');
if (snowfall && snowToggle) {
  snowToggle.hidden = false;
  snowToggle.addEventListener('click', () => {
    const paused = snowfall.classList.toggle('is-paused');
    snowToggle.setAttribute('aria-pressed', String(paused));
    snowToggle.textContent = paused ? 'Resume snowfall' : 'Pause snowfall';
  });
}
