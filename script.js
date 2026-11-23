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
    window.location.assign('for-parents.html');
  });
}

// Reveal the rest of the homepage when a visitor follows a section link.
const siteContent = document.querySelector('#site-content');
if (siteContent) {
  const revealLinkedSection = () => {
    const sectionId = window.location.hash.slice(1);
    const section = document.getElementById(sectionId);
    if (!section || !siteContent.contains(section)) return;
    siteContent.hidden = false;
    section.scrollIntoView();
    section.setAttribute('tabindex', '-1');
    section.focus({ preventScroll: true });
  };
  window.addEventListener('hashchange', revealLinkedSection);
  revealLinkedSection();
}

const kidsTabs = document.querySelector('.kids-tabs');
if (kidsTabs) {
  const tabs = [...kidsTabs.querySelectorAll('a[href^="#"]')];
  const panels = tabs.map(tab => document.querySelector(tab.hash));
  kidsTabs.setAttribute('role', 'tablist');
  const selectTab = selected => {
    tabs.forEach((tab, index) => {
      const active = tab === selected;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panels[index].id);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[index].setAttribute('role', 'tabpanel');
      panels[index].tabIndex = 0;
      panels[index].hidden = !active;
    });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', event => {
      event.preventDefault();
      selectTab(tab);
      history.replaceState(null, '', tab.hash);
      const scrollTarget = tab.dataset.scrollTarget;
      if (scrollTarget) document.getElementById(scrollTarget)?.scrollIntoView();
    });
    tab.addEventListener('keydown', event => {
      const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      tabs[next].focus();
      tabs[next].click();
    });
  });
  const selectLinkedTab = () => {
    const target = document.getElementById(window.location.hash.slice(1));
    const panelTarget = target?.dataset.panel
      ? document.getElementById(target.dataset.panel)
      : target;
    const panelIndex = panels.findIndex(panel => panelTarget && panel.contains(panelTarget));
    selectTab(tabs[panelIndex] || tabs[0]);
    if (target && panelIndex >= 0) target.scrollIntoView();
  };
  window.addEventListener('hashchange', selectLinkedTab);
  selectLinkedTab();

  const parentsBuyLink = document.querySelector('.parents-buy-link');
  const overviewBuyLink = document.querySelector('.parents-overview-buy-link');
  if (parentsBuyLink && overviewBuyLink) {
    const buyButton = overviewBuyLink.firstElementChild;
    const inlineBuyLinks = {
      '#parents-about': overviewBuyLink,
      '#parents-meet-book': document.getElementById('parents-book-buy-link'),
      '#parents-readers': document.getElementById('parents-readers-buy-link')
    };
    const updateParentsBuyLink = () => {
      const selectedTab = tabs.find(tab => tab.getAttribute('aria-selected') === 'true');
      const hiddenTabs = [
        '#parents-meet-author',
        '#parents-meet-illustrator',
        '#parents-ask-santa',
        '#parents-faq'
      ];
      const inlineDestination = inlineBuyLinks[selectedTab?.hash];
      const destination = inlineDestination || parentsBuyLink;
      if (buyButton.parentElement !== destination) destination.append(buyButton);
      parentsBuyLink.hidden = Boolean(inlineDestination) || hiddenTabs.includes(selectedTab?.hash);
    };
    tabs.forEach(tab => tab.addEventListener('click', updateParentsBuyLink));
    window.addEventListener('hashchange', updateParentsBuyLink);
    updateParentsBuyLink();
  }
}

const pawprintForm = document.querySelector('.pawprint-form');
if (pawprintForm) {
  const countInput = pawprintForm.querySelector('#pawprint-count');
  const result = pawprintForm.querySelector('.pawprint-result');
  countInput.addEventListener('input', () => {
    result.textContent = '';
  });
  pawprintForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!pawprintForm.reportValidity()) return;
    const count = countInput.valueAsNumber;
    const answer = pawprintForm.dataset.answer ? Number(pawprintForm.dataset.answer) : null;
    if (answer !== null) {
      result.textContent = count === answer
        ? 'Dasher’s delight! You found all ' + answer + ' paw prints.'
        : 'Oh! Dear deer! Take another look and try again.';
    } else {
      result.textContent = 'You counted ' + count + (count === 1 ? ' paw print.' : ' paw prints.');
    }
  });
}
