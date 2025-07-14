Shadee.Care Prototype: Agent & Developer Guide

Version: 1.0 (Post-Refactoring)
Status: Stable, Visually Complete

This document serves as the primary technical guide for developers and agents working on the Shadee.Care prototype. It details the project's purpose, architecture, features, and dependencies.

1. Project Overview

Shadee.Care is a charity focused on empowering young adults by providing holistic wellbeing solutions. This prototype is a high-fidelity, interactive demonstration of the key features and visual identity envisioned for the final website.

The prototype was initially built as a single index.html file and has since been refactored into a clean, maintainable structure with separate CSS and JavaScript files.

2. Getting Started / Local Setup

To run this prototype on your local machine, you will need a simple web server. Opening the index.html file directly in your browser (file:///...) will likely fail due to security restrictions on JavaScript modules (import).

Prerequisites

    A code editor (e.g., VS Code)

    A simple local web server. The Live Server extension for VS Code is highly recommended.

Folder Structure

The project must be set up with the following folder structure. The local dependencies are required for the site to function correctly.
Generated code

      
/ (Project Root)
├── css/
│   └── style.css              # All application styles
├── js/
│   ├── animations.js          # Hero section animations & menu logic (Module)
│   └── main.js                # Core UI logic & form validation
├── lib/                       # REQUIRED: Third-party libraries
│   ├── spline.js              # REQUIRED for blob animation
│   └── simplex-noise.js       # REQUIRED for blob animation
├── assets/
│   └── sunglass_bkgrd.png     # REQUIRED for parallax background
└── index.html                 # The main HTML entry point

    

IGNORE_WHEN_COPYING_START
Use code with caution.
IGNORE_WHEN_COPYING_END

Running the Prototype

    Ensure all files and folders are in the correct locations as shown above.

    Open the project root folder in your code editor.

    Start your local web server (e.g., right-click index.html and select "Open with Live Server" in VS Code).

    The prototype will open in your default browser.

3. Architecture & File Structure

The prototype follows a clean separation of concerns, making it easy to maintain and scale.

    index.html

        Purpose: The structural foundation of the application. It contains all the semantic HTML markup for the page content and links to all external CSS and JavaScript assets. It is intentionally free of any inline styles or scripts.

    css/style.css

        Purpose: The single source of truth for all visual styling. It includes global variables (for colors, gradients), element resets, component styles, and all responsive media queries.

    js/animations.js

        Purpose: A dedicated JavaScript module for handling the performance-intensive animations in the hero section. This includes the canvas-based bubble and the SVG blobs. It also contains the logic for the responsive navigation menu.

        Loading: Loaded as <script type="module">.

    js/main.js

        Purpose: Handles all other core UI logic. This includes the scroll-triggered "sunglasses" overlay, the "scroll to top" button, and the client-side contact form validation.

        Loading: Loaded with <script defer>.

4. Dependencies

The prototype relies on several local and external files to function correctly.

Local Dependencies (Must be present)

    lib/spline.js: Powers the SVG spline interpolation for the hero blobs. The hero animation will fail without this file.

    lib/simplex-noise.js: Provides the noise algorithm that drives the organic movement of the hero blobs. The hero animation will fail without this file.

    assets/sunglass_bkgrd.png: The image used for the parallax background effect on the main content area. The site will function without it, but the visual effect will be missing.

External Dependencies (Loaded via CDN)

    Font Awesome: Used for icons throughout the site. Loaded via a <link> tag in the <head>.

    Jotform Chatbot: The chat widget embedded in the bottom right corner. Loaded via a <script> tag at the end of the <body>.

5. Key Features & Implementation

a. Animated Hero Section

    Implementation: The entire hero section is controlled by js/animations.js.

    Center Bubble: A single, large, blurred bubble is rendered on a <canvas> element for a soft, dynamic background.

    SVG Blobs: Four SVG blobs are generated and animated using spline.js and simplex-noise.js, creating a fluid, organic feel. They are strategically placed to avoid the center content area.

    Parallax Text: The main headline (.hero__copy) has a subtle parallax effect on scroll to create a sense of depth.

    Critical Fix (overflow-y: scroll): The html tag is styled with overflow-y: scroll in style.css. This prevents the entire page from "jumping" when the scrollbar appears, ensuring animation stability.

b. Responsive Navigation

    Implementation: The navigation menu is fully responsive, handled by js/animations.js and css/style.css.

    Desktop: Features hover-to-show submenus and an informational tooltip.

    Mobile (breakpoint < 860px): Collapses into a hamburger menu. When opened, it takes over the full screen and disables body scroll (via the .menu-open class on the <html> tag) for a clean user experience.

c. Fading "Sunglasses" Background

    Implementation: This effect is handled by css/style.css and js/main.js.

    CSS: The .content::after pseudo-element has the sunglass_bkgrd.png image applied with background-attachment: fixed.

    JavaScript: A scroll listener in main.js adds the .show-overlay class to the .content div once the user scrolls past the hero section, which fades the pseudo-element in.

d. Floating Action Buttons & Chatbot

    Implementation: These elements are within <div id="fixed-actions-container">.

    Stacking Context (z-index): The container has a z-index: 1010, which is a critical value. It ensures these buttons appear above the hero navigation menu (#hero-menu, z-index: 1000).

    Scroll to Top Button: Hidden by default. Logic in main.js adds a .visible class to fade it in after 300px of scrolling.

    Chatbot Positioning: The container is pushed up from the bottom (bottom: 9rem;) to avoid UI clashes with the Jotform chatbot's default position.

e. Form Validation

    Implementation: All logic is contained within js/main.js.

    Functionality: Performs robust client-side validation on the contact form for:

        Required fields (name, organization, email).

        A check that at least one "area of interest" checkbox is selected.

        A block on free email providers (e.g., gmail.com, hotmail.com) to encourage corporate inquiries.

    Current State: On successful validation, form data is logged to the browser console.

6. Potential Next Steps & Recommendations

    Form Backend: The highest priority is to connect the contact form to a real backend endpoint. The fetch call in main.js should be modified to POST data to a server-side script for processing.

    Performance: The hero animations are JavaScript-heavy. For a high-traffic production site, performance should be profiled on various devices. Consider optimizations or lighter-weight alternatives if necessary.

    Accessibility (A11y): While basic ARIA labels are in place, a full accessibility audit is recommended before launch to ensure WCAG compliance for all users.

    Asset Optimization: Images and other static assets should be compressed and optimized for faster load times.