// Overridable at build time (VITE_API_BASE_URL) so a build can point at a
// different backend port — e.g. the desktop app, which runs its own bundled
// backend on a separate port so it can run alongside the normal dev setup.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
