/**
 * PRODUCT PAGE PROGRESSIVE LOADER - SetInterval Based
 * Target: FCP < 1s, LCP < 2.5s, TBT < 200ms
 * Strategy: Load critical content instantly, defer everything else via setInterval batches
 */

(function() {
  'use strict';
  
  /* OPTIMIZATION: Configuration for progressive loading */
  const CONFIG = {
    intervalDelay: 3000, // 3 seconds between batches
    isMobile: window.innerWidth <= 768,
    isProductPage: document.body.classList.contains('template-product')
  };
  
  /* OPTIMIZATION: Batch tracking */
  let currentBatch = 0;
  let intervalTimer = null;
  let batchesLoaded = {
    batch1: false,
    batch2: false,
    batch3: false,
    batch4: false
  };
  
  /* OPTIMIZATION: Console logging for debugging */
  function logProgress(message, details) {
    console.log(`[Progressive Loader] ${message}`, details || '');
  }
  
  /* OPTIMIZATION: Batch 1 - Core JS and critical functionality */
  function loadBatch1() {
    if (batchesLoaded.batch1) return;
    batchesLoaded.batch1 = true;
    
    const batch1Items = [];
    
    // Load Empire.js (core theme functionality)
    if (!window.Empire) {
      const empireScript = document.createElement('script');
      empireScript.src = document.querySelector('[data-scripts]')?.getAttribute('data-shopify-api-url')?.replace('api.jquery.js', 'empire.min.js') || '/assets/empire.min.js';
      empireScript.async = true;
      empireScript.defer = true;
      document.body.appendChild(empireScript);
      batch1Items.push('JS: empire.min.js');
    }
    
    // Load Swiper if not already loaded
    if (!window.Swiper && document.querySelector('#mainSwiper')) {
      const swiperScript = document.createElement('script');
      swiperScript.src = document.querySelector('link[href*="swiper-bundle.min.js"]')?.href || '/assets/swiper-bundle.min.js';
      swiperScript.async = true;
      swiperScript.onload = function() {
        batch1Items.push('JS: swiper-bundle.min.js');
        if (typeof window.initProductSwiper === 'function') {
          window.initProductSwiper(document);
        }
      };
      document.body.appendChild(swiperScript);
    }
    
    logProgress('Batch 1 loaded:', batch1Items.join(', '));
  }
  
  /* OPTIMIZATION: Batch 2 - Non-critical CSS and styles */
  function loadBatch2() {
    if (batchesLoaded.batch2) return;
    batchesLoaded.batch2 = true;
    
    const batch2Items = [];
    
    // Load non-critical CSS
    const customCSS = document.querySelector('link[href*="custom.css"]');
    if (customCSS && customCSS.rel === 'preload') {
      customCSS.rel = 'stylesheet';
      batch2Items.push('CSS: custom.css');
    }
    
    const rippleCSS = document.querySelector('link[href*="ripple.css"]');
    if (rippleCSS && rippleCSS.rel === 'preload') {
      rippleCSS.rel = 'stylesheet';
      batch2Items.push('CSS: ripple.css');
    }
    
    // Load Swiper CSS
    const swiperCSS = document.querySelector('link[href*="swiper-bundle.min.css"]');
    if (swiperCSS && swiperCSS.rel === 'preload') {
      swiperCSS.rel = 'stylesheet';
      batch2Items.push('CSS: swiper-bundle.min.css');
    }
    
    logProgress('Batch 2 loaded:', batch2Items.join(', '));
  }
  
  /* OPTIMIZATION: Batch 3 - Product gallery images and thumbnails */
  function loadBatch3() {
    if (batchesLoaded.batch3) return;
    batchesLoaded.batch3 = true;
    
    const batch3Items = [];
    
    // Load product gallery thumbnails
    const thumbnails = document.querySelectorAll('#thumbSwiper img[loading="lazy"]');
    thumbnails.forEach((img, index) => {
      img.loading = 'eager';
      if (index === 0) batch3Items.push(`Images: ${thumbnails.length} thumbnails`);
    });
    
    // Load main gallery images (except first which is already eager)
    const mainImages = document.querySelectorAll('#mainSwiper img[loading="lazy"]');
    mainImages.forEach((img, index) => {
      img.loading = 'eager';
      if (index === 0) batch3Items.push(`Images: ${mainImages.length} main images`);
    });
    
    // Initialize Swiper if loaded
    if (window.Swiper && typeof window.initProductSwiper === 'function') {
      window.initProductSwiper(document);
      batch3Items.push('Function: initSwiper');
    }
    
    logProgress('Batch 3 loaded:', batch3Items.join(', '));
  }
  
  /* OPTIMIZATION: Batch 4 - Product recommendations lazy loading */
  function loadBatch4() {
    if (batchesLoaded.batch4) return;
    batchesLoaded.batch4 = true;
    
    const batch4Items = [];
    
    // Load product recommendations images with lazy loading
    const recommendationsSection = document.querySelector('[data-product-recommendations]');
    if (recommendationsSection) {
      // Load recommendation images
      const recImages = recommendationsSection.querySelectorAll('img[loading="lazy"]');
      recImages.forEach(img => {
        img.loading = 'eager';
      });
      
      if (recImages.length > 0) {
        batch4Items.push(`Recommendations: ${recImages.length} products`);
      }
    }
    
    logProgress('Batch 4 loaded:', batch4Items.join(', '));
    
    // Clear interval after all batches loaded
    if (intervalTimer) {
      clearInterval(intervalTimer);
      logProgress('All batches completed. SetInterval cleared.');
    }
  }
  
  /* OPTIMIZATION: SetInterval batch loader */
  function startProgressiveLoading() {
    logProgress('SetInterval timer started: true');
    
    intervalTimer = setInterval(function() {
      currentBatch++;
      
      logProgress(`Fetching and calling: Batch ${currentBatch}`);
      
      switch(currentBatch) {
        case 1:
          loadBatch1();
          break;
        case 2:
          loadBatch2();
          break;
        case 3:
          loadBatch3();
          break;
        case 4:
          loadBatch4();
          break;
        default:
          clearInterval(intervalTimer);
          logProgress('SetInterval timer stopped: all batches complete');
      }
    }, CONFIG.intervalDelay);
  }
  
  /* OPTIMIZATION: Initialize on window load */
  if (CONFIG.isProductPage) {
    window.addEventListener('load', function() {
      // Small delay to ensure page is fully loaded
      setTimeout(startProgressiveLoading, 100);
    });
  }
  
  /* OPTIMIZATION: Expose for manual control if needed */
  window.ProductPageLoader = {
    startLoading: startProgressiveLoading,
    loadBatch: function(batchNum) {
      switch(batchNum) {
        case 1: loadBatch1(); break;
        case 2: loadBatch2(); break;
        case 3: loadBatch3(); break;
        case 4: loadBatch4(); break;
      }
    },
    getStatus: function() {
      return {
        currentBatch: currentBatch,
        batchesLoaded: batchesLoaded,
        intervalActive: intervalTimer !== null
      };
    }
  };
  
})();
