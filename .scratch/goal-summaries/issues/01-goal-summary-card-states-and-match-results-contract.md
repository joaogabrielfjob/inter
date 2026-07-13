# 01 — Goal Summary card states and Match Results contract

**What to build:** Every completed-Match card gives a supporter a top-right **Ver gols** action that flips the unchanged result front face to a Goal Summary face and **Voltar ao resultado** back again. The Match Results batch carries the Goal Summary state and any stored Goal entries needed for that instant interaction.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] A completed-Match card has an instant, accessible front/back interaction, with a reduced-motion alternative and no per-card request.
- [ ] The Goal Summary face displays smaller Team Emblems, a scoreless message for 0–0, and the unavailable message when the final score is known but no verified Goal Summary exists.
- [ ] The persisted Match and browser-facing Match Results contract can represent Goal Summary availability and display-ready Goal entries without exposing ESPN source identity.
- [ ] Existing Match Results filters, cursor pagination, and front-face information continue to work.
