import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useScrollAnimations() {
  useEffect(() => {
    // Wait for DOM to be ready
    const ctx = gsap.context(() => {
      // Services cards: slide in from bottom
      gsap.from('.service-card', {
        scrollTrigger: {
          trigger: '.services-section',
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
      })

      // Section titles: reveal from left (exclude gallery)
      gsap.utils.toArray('.section-title:not(#gallery .section-title)').forEach((el) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
          x: -50,
          opacity: 0,
          duration: 0.7,
          ease: 'expo.out',
        })
      })

      // Glass cards: fade in on scroll (exclude gallery placeholders)
      gsap.utils.toArray('.glass-card:not(#gallery .glass-card)').forEach((el, i) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
          y: 40,
          opacity: 0,
          duration: 0.6,
          delay: i * 0.05,
          ease: 'power2.out',
        })
      })

      // Geometric grid parallax
      gsap.to('.geo-grid', {
        scrollTrigger: {
          trigger: 'body',
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
        y: -200,
        ease: 'none',
      })

      // How it works steps: stagger in
      gsap.from('.step-card', {
        scrollTrigger: {
          trigger: '.steps-section',
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
        y: 50,
        opacity: 0,
        duration: 0.7,
        stagger: 0.2,
        ease: 'power3.out',
      })

      // Ensure ScrollTrigger calculates correct positions after all components mount
      setTimeout(() => {
        ScrollTrigger.refresh()
      }, 500)
    })

    return () => ctx.revert()
  }, [])
}
