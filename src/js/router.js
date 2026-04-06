class Router {
  #routes = new Map();
  #notFoundHandler = null;

  on(pattern, handler) {
    this.#routes.set(pattern, handler);
    return this;
  }

  onNotFound(handler) {
    this.#notFoundHandler = handler;
    return this;
  }

  navigate(path) {
    window.location.hash = path;
  }

  start() {
    window.addEventListener("hashchange", () => this.#resolve());
    this.#resolve();
  }

  #resolve() {
    const path = window.location.hash.slice(1) || "/";
    for (const [pattern, handler] of this.#routes) {
      const result = this.#match(pattern, path);
      if (result.matched) {
        handler(result.params);
        return;
      }
    }
    this.#notFoundHandler?.();
  }

  #match(pattern, path) {
    const paramNames = [];

    const regexStr = pattern
      .split("/")
      .map((segment) => {
        if (segment.startsWith(":")) {
          paramNames.push(segment.slice(1));
          return "([^/]+)";
        }
        return segment;
      })
      .join("/");

    const match = path.match(new RegExp(`^${regexStr}$`));
    if (!match) return { matched: false, params: {} };

    const params = Object.fromEntries(
      paramNames.map((name, i) => [name, match[i + 1]]),
    );
    return { matched: true, params };
  }
}

export const router = new Router();
