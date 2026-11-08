# QuranLight 🌙

**Application Web progressive (PWA) de lecture du Coran, d'horaires de prière et de calendrier musulman.**

[Voir le site en ligne](https://quranlight.vercel.app)

---

## Fonctionnalités

- **Coran** : lecture des sourates et écoute de récitations, avec une bibliothèque de récitateurs.
- **Horaires de prière** calculés selon la position de l'utilisateur (géolocalisation).
- **Direction de la Qibla**.
- **Calendrier musulman** et calendrier du Ramadan.
- **Hadiths** et assistant conversationnel.
- **Application installable et utilisable hors ligne** grâce au manifeste et au service worker.
- **Préférences sauvegardées** localement (paramètres de l'utilisateur).

## Technologies

HTML · CSS · JavaScript · API REST ([AlQuran.cloud](https://alquran.cloud/api), [Aladhan](https://aladhan.com/prayer-times-api)) · PWA (manifeste, service worker) · Vercel

## Structure

```
index.html, quran.html, salat.html, qibla.html, calendar.html, ...   Pages de l'application
assets/                                                                Styles, scripts, images et polices
manifest.json, sw.js                                                   Installation et mode hors ligne
quran-light-app/                                                       Version Next.js expérimentale
```

## Lancer en local

Aucun outil de compilation n'est nécessaire : servez simplement le dossier avec un serveur statique.

```bash
npx serve .
```

---

### English summary

QuranLight is a progressive web app for reading and listening to the Quran, with location-based prayer times, Qibla direction, an Islamic and Ramadan calendar, and offline support. Built with HTML, CSS and JavaScript on top of public REST APIs, and deployed on Vercel.

**Auteur :** Mohamed Tahirou Adamou
