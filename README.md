# Mini Wind Turbine — 3D Presentation

A self-hosted, browser-based 3D slideshow inspired by the uploaded reference photo. It models a small three-blade turbine, blue support frame, DC motor, wiring and base. Slide navigation changes the camera angle while keeping one persistent 3D model in the scene.

## Requirements
- Node.js 20.19+ or 22.12+
- npm
- A modern browser with WebGL

## Run locally
```bash
npm install
npm run dev -- --host 0.0.0.0
```
Open the address printed by Vite. For another device on your LAN, use your server's LAN IP and the Vite port (normally 5173).

## Build for hosting
```bash
npm install
npm run build
```
Upload the contents of `dist/` to your web server's document root.

Example Nginx server block:
```nginx
server {
    listen 80;
    server_name presentation.example.com;
    root /var/www/mini-wind-turbine/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Controls
- `←` / `→`: previous / next slide
- Drag: orbit around the model
- Scroll: zoom
- Rotation button: pause / resume rotor
- Reset view button or `R`: reset the camera

## Notes
- The model is a procedural visual approximation based on the supplied photo, not a measured CAD reconstruction. Adjust dimensions and components in `src/main.js` to match the physical project more closely.
- Three.js is installed through npm and bundled by Vite. Google Fonts are loaded from Google Fonts; the site remains usable with fallback fonts if that service is unavailable.
- The slides describe the DC motor as a generator in general terms. Confirm the actual belt/shaft arrangement and wiring of the physical model before using the presentation as a precise technical diagram.
