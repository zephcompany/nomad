document.documentElement.classList.remove('no-js');

document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  document.querySelectorAll('[data-product-form]').forEach((form) => {
    const variants = JSON.parse(form.querySelector('[data-variants-json]')?.textContent || '[]');
    const variantId = form.querySelector('[name="id"]');
    const price = form.closest('.product-info')?.querySelector('[data-product-price]');
    const button = form.querySelector('[type="submit"]');

    const syncVariant = () => {
      const selected = Array.from(form.querySelectorAll('[data-option-index]')).map((group) => {
        const checked = group.querySelector('input:checked');
        return checked ? checked.value : null;
      });
      const match = variants.find((variant) => variant.options.every((value, index) => value === selected[index]));
      if (!match) return;
      variantId.value = match.id;
      if (price) price.textContent = Shopify.formatMoney ? Shopify.formatMoney(match.price) : (match.price / 100).toLocaleString(undefined, {style:'currency', currency: window.Shopify?.currency?.active || 'USD'});
      if (button) {
        button.disabled = !match.available;
        button.textContent = match.available ? 'Add to cart' : 'Sold out';
      }
      const url = new URL(window.location.href);
      url.searchParams.set('variant', match.id);
      window.history.replaceState({}, '', url);
    };

    form.addEventListener('change', syncVariant);
    syncVariant();
  });
});
