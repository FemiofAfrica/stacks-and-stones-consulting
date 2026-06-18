const revealItems = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.18 });

revealItems.forEach((item) => observer.observe(item));

const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
  header.style.transform = window.scrollY > 40 ? 'translateY(-2px)' : 'translateY(0)';
});
