export function showLoader(loaderElement) {
  return new Promise(resolve => {
    loaderElement.style.display = 'grid';
    setTimeout(() => {
      loaderElement.classList.add('loaded');
      loaderElement.style.opacity = '0';
      setTimeout(() => {
        loaderElement.style.display = 'none';
        resolve();
      }, 500);
    }, 1200);
  });
}
