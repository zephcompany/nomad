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

  document.querySelectorAll('[data-product-card]').forEach((card) => {
    const primaryImage = card.querySelector('.product-card__primary');
    const swatches = Array.from(card.querySelectorAll('[data-color-swatch]'));
    const swatchWrap = card.querySelector('[data-card-swatches]');

    const setCardColor = (swatch) => {
      if (!primaryImage || !swatch || !swatch.dataset.image) return;

      primaryImage.removeAttribute('srcset');
      primaryImage.removeAttribute('sizes');
      primaryImage.src = swatch.dataset.image;

      swatches.forEach((item) => {
        item.classList.toggle('is-active', item === swatch);
        item.setAttribute('aria-pressed', item === swatch ? 'true' : 'false');
      });
    };

    swatches.forEach((swatch) => {
      swatch.setAttribute('aria-pressed', swatch.classList.contains('is-active') ? 'true' : 'false');

      swatch.addEventListener('mouseenter', () => {
        card.classList.add('is-swatch-interacting');
        setCardColor(swatch);
      });

      swatch.addEventListener('focus', () => {
        card.classList.add('is-swatch-interacting');
        setCardColor(swatch);
      });

      swatch.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        card.classList.add('is-swatch-interacting');
        setCardColor(swatch);
      });
    });

    if (swatchWrap) {
      swatchWrap.addEventListener('mouseleave', () => card.classList.remove('is-swatch-interacting'));
      swatchWrap.addEventListener('focusout', () => {
        requestAnimationFrame(() => {
          if (!swatchWrap.contains(document.activeElement)) {
            card.classList.remove('is-swatch-interacting');
          }
        });
      });
    }
  });

  document.querySelectorAll('[data-product-gallery]').forEach((gallery) => {
    const mainImage = gallery.querySelector('[data-product-main-image]');
    const thumbnails = Array.from(gallery.querySelectorAll('[data-gallery-thumbnail]'));

    const showImage = (thumbnail) => {
      if (!mainImage || !thumbnail || !thumbnail.dataset.imageSrc) return;

      mainImage.removeAttribute('srcset');
      mainImage.removeAttribute('sizes');
      mainImage.src = thumbnail.dataset.imageSrc;
      mainImage.alt = thumbnail.dataset.imageAlt || mainImage.alt;

      thumbnails.forEach((item) => item.classList.toggle('is-active', item === thumbnail));
    };

    thumbnails.forEach((thumbnail) => {
      thumbnail.addEventListener('click', () => showImage(thumbnail));
    });
  });

  document.querySelectorAll('[data-product-form]').forEach((form) => {
    const variants = JSON.parse(form.querySelector('[data-variants-json]')?.textContent || '[]');
    const variantId = form.querySelector('[name="id"]');
    const productPage = form.closest('.product-page');
    const price = productPage?.querySelector('[data-product-price]');
    const button = form.querySelector('[type="submit"]');
    const mainImage = productPage?.querySelector('[data-product-main-image]');
    const thumbnails = Array.from(productPage?.querySelectorAll('[data-gallery-thumbnail]') || []);

    const syncVariant = () => {
      const selected = Array.from(form.querySelectorAll('[data-option-index]')).map((group) => {
        const checked = group.querySelector('input:checked');
        return checked ? checked.value : null;
      });

      const match = variants.find((variant) =>
        variant.options.every((value, index) => value === selected[index])
      );

      if (!match) return;

      if (variantId) variantId.value = match.id;

      if (price) {
        if (window.Shopify && typeof window.Shopify.formatMoney === 'function') {
          price.textContent = window.Shopify.formatMoney(match.price);
        } else {
          price.textContent = (match.price / 100).toLocaleString(undefined, {
            style: 'currency',
            currency: window.Shopify?.currency?.active || 'USD'
          });
        }
      }

      if (button) {
        button.disabled = !match.available;
        button.textContent = match.available ? 'Add to cart' : 'Sold out';
      }

      if (mainImage && match.featured_image?.src) {
        mainImage.removeAttribute('srcset');
        mainImage.removeAttribute('sizes');
        mainImage.src = match.featured_image.src;

        if (match.featured_image.id) {
          thumbnails.forEach((thumb) => {
            thumb.classList.toggle('is-active', String(thumb.dataset.imageId) === String(match.featured_image.id));
          });
        }
      }

      const url = new URL(window.location.href);
      url.searchParams.set('variant', match.id);
      window.history.replaceState({}, '', url);
    };

    form.addEventListener('change', syncVariant);
    syncVariant();
  });
});
