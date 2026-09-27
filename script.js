const observer=new IntersectionObserver((entries)=>{entries.forEach((entry)=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}})},{threshold:.14});
document.querySelectorAll('.reveal-on-scroll').forEach(el=>observer.observe(el));

document.querySelectorAll('a[href^="#"]').forEach(link=>{
  link.addEventListener('click',e=>{
    const id=link.getAttribute('href');
    const target=document.querySelector(id);
    if(target){e.preventDefault();target.scrollIntoView({behavior:'smooth',block:'start'})}
  })
});

const hero=document.querySelector('.hero');
const word=document.querySelector('.hero-word');
const phone=document.querySelector('.hero-phone-wrap');
window.addEventListener('scroll',()=>{
  if(!hero||!word||!phone)return;
  const rect=hero.getBoundingClientRect();
  if(rect.bottom>0){
    const y=Math.max(0,-rect.top);
    word.style.transform=`translateY(${y*.08}px)`;
    phone.style.marginTop=`${y*.035}px`;
  }
},{passive:true});
