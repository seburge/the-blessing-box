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
