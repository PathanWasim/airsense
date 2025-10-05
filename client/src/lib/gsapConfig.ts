import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Make sure ScrollTrigger is registered
gsap.registerPlugin(ScrollTrigger);

export const setupScrollTriggers = () => {
  // Fade up animations
  gsap.utils.toArray('[data-animation="fade-up"]').forEach((element: any) => {
    gsap.from(element, {
      scrollTrigger: {
        trigger: element,
        start: 'top 80%'
      },
      y: 50,
      opacity: 0,
      duration: 0.8
    });
  });

  // Fade up with delay
  gsap.utils.toArray('[data-animation="fade-up-delay"]').forEach((element: any) => {
    gsap.from(element, {
      scrollTrigger: {
        trigger: element,
        start: 'top 80%'
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      delay: 0.3
    });
  });

  // Fade up with more delay
  gsap.utils.toArray('[data-animation="fade-up-delay-more"]').forEach((element: any) => {
    gsap.from(element, {
      scrollTrigger: {
        trigger: element,
        start: 'top 80%'
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      delay: 0.6
    });
  });

  // Fade right
  gsap.utils.toArray('[data-animation="fade-right"]').forEach((element: any) => {
    gsap.from(element, {
      scrollTrigger: {
        trigger: element,
        start: 'top 80%'
      },
      x: -50,
      opacity: 0,
      duration: 0.8
    });
  });

  // Fade left
  gsap.utils.toArray('[data-animation="fade-left"]').forEach((element: any) => {
    gsap.from(element, {
      scrollTrigger: {
        trigger: element,
        start: 'top 80%'
      },
      x: 50,
      opacity: 0,
      duration: 0.8
    });
  });

  // Width animations
  gsap.utils.toArray('[data-animation="width"]').forEach((element: any) => {
    gsap.from(element, {
      scrollTrigger: {
        trigger: element,
        start: 'top 80%'
      },
      width: 0,
      duration: 1
    });
  });

  // Staggered animations
  gsap.utils.toArray('[data-animation="stagger"]').forEach((element: any) => {
    const children = (element as HTMLElement).children;
    
    gsap.from(children, {
      scrollTrigger: {
        trigger: element,
        start: 'top 80%'
      },
      y: 50,
      opacity: 0,
      duration: 0.5,
      stagger: 0.2
    });
  });

  // Staggered card animations
  gsap.utils.toArray('[data-animation="stagger-cards"]').forEach((element: any) => {
    const children = (element as HTMLElement).children;
    
    gsap.from(children, {
      scrollTrigger: {
        trigger: element,
        start: 'top 80%'
      },
      y: 50,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1
    });
  });

  // Staggered icon animations
  gsap.utils.toArray('[data-animation="stagger-icons"]').forEach((element: any) => {
    const children = (element as HTMLElement).children;
    
    gsap.from(children, {
      scrollTrigger: {
        trigger: element,
        start: 'top 80%'
      },
      scale: 0.5,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1
    });
  });
};
