export const initializeTheme = () => {
  try {
    const storageKey = 'healthnexus-ui-theme';
    const theme = window.localStorage.getItem(storageKey);
    const root = document.documentElement;

    root.classList.add('preload');
    root.classList.remove('light', 'dark');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.add('light');
    } else {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    }

    setTimeout(() => root.classList.remove('preload'), 100);
  } catch (error) {
    console.warn('Failed to initialize theme:', error);
    document.documentElement.classList.add('light');
  }
};

if (typeof window !== 'undefined') {
  initializeTheme();

  window.addEventListener('storage', (e) => {
    if (e.key === 'healthnexus-ui-theme') {
      initializeTheme();
    }
  });
}
