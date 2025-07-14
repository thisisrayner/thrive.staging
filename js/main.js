/**
 * File: /js/main.js
 * 
 * Purpose: Handles primary UI interactions and form logic for the main content of the page.
 * 
 * Description:
 * This script is executed after the DOM is fully loaded. It is responsible for features
 * that are not part of the hero section's complex animations. This separation keeps the
 * code organized and allows for different loading strategies (e.g., `defer`).
 * 
 * Key Functions:
 * 1.  Fading Sunglasses Overlay: Listens for scroll events to fade in the fixed-background
 *     image overlay once the user scrolls past the hero section.
 * 2.  Scroll-to-Top Button: Manages the visibility of the "scroll to top" button, showing
 *     it after a certain scroll depth and handling the smooth scroll behavior on click.
 * 3.  Contact Form Validation: Provides robust client-side validation for the contact form.
 * 4.  Cursor Bubble Trail: Creates a decorative bubble trail effect that follows the cursor.
 *
 * Dependencies:
 * - None. This script is self-contained and interacts directly with the DOM.
 */

document.addEventListener('DOMContentLoaded', function() {

  // --- Fading Sunglasses & Scroll-to-Top Logic ---
  const contentSection = document.querySelector('.content');
  const heroSection = document.querySelector('.hero');
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  
  if (heroSection) {
    const handleScroll = () => {
      const scrollThreshold = heroSection.offsetHeight * 0.4; 
      const showButtonThreshold = 300;

      if (contentSection && window.scrollY >= scrollThreshold) {
        contentSection.classList.add('show-overlay');
      } else if (contentSection) {
        contentSection.classList.remove('show-overlay');
      }

      if (scrollTopBtn && window.scrollY > showButtonThreshold) {
        scrollTopBtn.classList.add('visible');
      } else if (scrollTopBtn) {
        scrollTopBtn.classList.remove('visible');
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
  }
  
  if(scrollTopBtn) {
    scrollTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  
  // --- Form Validation Logic ---
  const form = document.getElementById('contact-form');
  if (form) {
    const messageDiv = document.getElementById('form-message');
    const submitButton = form.querySelector('button[type="submit"]');
    
    const forbiddenDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 
      'aol.com', 'icloud.com', 'msn.com', 'protonmail.com', 'zoho.com',
      'yandex.com', 'gmx.com', 'mail.com'
    ];

    form.addEventListener('submit', function(event) {
      event.preventDefault();
      
      messageDiv.textContent = '';
      messageDiv.className = '';

      const name = document.getElementById('name').value.trim();
      const org = document.getElementById('org').value.trim();
      const email = document.getElementById('email').value.trim();
      const interests = document.querySelectorAll('input[name="interest"]:checked');

      if (name === '' || org === '' || email === '') {
        showMessage('Please fill out all required fields.', 'error');
        return;
      }
      if (interests.length === 0) {
        showMessage('Please select at least one area of interest.', 'error');
        return;
      }
      const emailDomain = email.split('@')[1];
      if (!emailDomain || forbiddenDomains.includes(emailDomain.toLowerCase())) {
        showMessage('Please use a valid organization email. Free email providers are not accepted.', 'error');
        return;
      }

      showMessage('Thank you for your submission! We will be in touch shortly.', 'success');
      submitButton.disabled = true;
      
      console.log("Form Submitted:", {
          name: name,
          organization: org,
          email: email,
          interests: Array.from(interests).map(cb => cb.value)
      });

      setTimeout(() => {
          form.reset();
          submitButton.disabled = false;
          messageDiv.textContent = '';
          messageDiv.className = '';
      }, 4000);
    });

    function showMessage(message, type) {
      messageDiv.textContent = message;
      messageDiv.className = type;
    }
  }

  // --- Cursor Bubble Trail Effect ---
  let bubbleCounter = 0;
  document.addEventListener('mousemove', (e) => {
    // Disable effect on smaller screens (matches CSS media query)
    if (window.innerWidth <= 1024) return;

    // Reduce number of bubbles for a more subtle effect
    bubbleCounter++;
    if (bubbleCounter % 5 !== 0) return;

    const size = Math.floor(Math.random() * 12) + 8;

    const bubble = document.createElement('div');
    bubble.classList.add('cursor-bubble'); // MODIFIED: Renamed class to avoid conflict
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${e.clientX - size / 2}px`;
    bubble.style.top = `${e.clientY - size / 2}px`;

    document.body.appendChild(bubble);

    // Remove the bubble after its animation completes
    setTimeout(() => {
      bubble.remove();
    }, 1200);
  });

});