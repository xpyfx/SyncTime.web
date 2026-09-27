const observer = new IntersectionObserver((entries)=>{entries.forEach((entry)=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}})}, {threshold:.16});
document.querySelectorAll('.reveal-on-scroll').forEach((el)=>observer.observe(el));

document.querySelectorAll('a[href^="#"]').forEach((a)=>{
  a.addEventListener('click',(e)=>{
    const target=document.querySelector(a.getAttribute('href'));
    if(target){e.preventDefault();target.scrollIntoView({behavior:'smooth',block:'start'});}
  });
});