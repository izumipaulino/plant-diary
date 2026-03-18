// Router - simple hash-based routing for agent/plant pages

export function initRouter(routes) {
  window.addEventListener('hashchange', () => handleRoute(routes));
  handleRoute(routes);
}

function handleRoute(routes) {
  const hash = window.location.hash.slice(1) || '/';
  const feed = document.getElementById('feed');

  // Match routes
  for (const route of routes) {
    const match = hash.match(route.pattern);
    if (match) {
      route.handler(match, feed);
      return;
    }
  }

  // Default: show feed
  if (routes.default) routes.default(feed);
}

export function navigate(path) {
  window.location.hash = path;
}
