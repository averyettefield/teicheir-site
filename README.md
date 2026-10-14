# Teicheir

A separate creator and UGC brand website built with HTML, CSS, and JavaScript. The design uses clean cream/blush surfaces, burgundy accents, editorial typography, content pillars, channel links, and a prominent collaboration path. This project does not change the professional portfolio.

## Preview in VS Code

Open `teicheir-site.code-workspace`. Run `npm start`, then visit http://127.0.0.1:4173. No package installation is required. VS Code Live Server can also serve `index.html`.

## Pages

Home, About, Videos, Photography, Journal, Projects, and Work with me are separate HTML pages. Shared styles and interactions are in `assets/`; `creator.css` defines the current brand direction on top of the shared layout styles. All internal URLs are relative so the site works under a GitHub Pages repository path.

## Content and privacy

The logo and mascot were copied from the supplied conversation attachments without modification. Their original appearance and attribution marks are preserved. No invented photos, video titles, published journal entries, audience statistics, email addresses, or biography details are included.

The photo preview uses temporary browser object URLs; images are not uploaded and vanish when the tab reloads. Journal drafts and saved-project preferences use localStorage on the current browser origin. A downloaded journal draft is not published. Contact links to the supplied Instagram profile rather than using a nonfunctional form. Social links were supplied by the user; automated live-profile verification was blocked by the platforms.

Google Fonts is optional and has local serif/sans-serif fallbacks. The site requires no analytics, accounts, API keys, or backend.

## GitHub Pages

Repository: https://github.com/averyettefield/teicheir-site . Pages uses the `main` branch at `/ (root)`. `.nojekyll` is included. The project URL is https://averyettefield.github.io/teicheir-site/ . Publication of this version was authorized by the user.

## Editing

Edit the individual HTML files directly. Add published content when ready; the current archive and journal intentionally use launch states. Replace or extend assets within `assets/`. Keep filenames lowercase and use relative links. `npm run check` checks JavaScript syntax.
