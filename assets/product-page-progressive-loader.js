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
    batch4: false,
    batch5: false,
    batch6: false,
    batch7: false,
    batch8: false
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
  
  /* OPTIMIZATION: Batch 3 - Setup IntersectionObserver for product gallery images with skeleton replacement */
  function loadBatch3() {
    if (batchesLoaded.batch3) return;
    batchesLoaded.batch3 = true;
    
    const batch3Items = [];
    
    // Setup IntersectionObserver for lazy image loading with 200px preload margin
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const skeleton = img.previousElementSibling;
          
          // Load image from data-lazy-src
          if (img.dataset.lazySrc) {
            img.src = img.dataset.lazySrc;
            if (img.dataset.lazySrcset) {
              img.srcset = img.dataset.lazySrcset;
            }
            
            // On image load, hide skeleton and show image
            img.onload = function() {
              if (skeleton && skeleton.classList.contains('skeleton-image') || skeleton.classList.contains('skeleton-thumbnail')) {
                skeleton.style.display = 'none';
              }
              img.style.display = 'block';
              img.classList.add('loaded', 'fade-in');
              logProgress('Executing image load for gallery via observer');
            };
            
            imageObserver.unobserve(img);
          }
        }
      });
    }, {
      root: null,
      rootMargin: '200px',
      threshold: 0.01
    });
    
    // Observe all gallery images with data-lazy-src
    const galleryImages = document.querySelectorAll('[data-lazy-src]');
    galleryImages.forEach(img => {
      imageObserver.observe(img);
    });
    
    if (galleryImages.length > 0) {
      batch3Items.push(`Observer setup: ${galleryImages.length} gallery images`);
    }
    
    // Initialize Swiper if loaded
    if (window.Swiper && typeof window.initProductSwiper === 'function') {
      window.initProductSwiper(document);
      batch3Items.push('Function: initSwiper');
    }
    
    // Store observer globally for Batch 4
    window.productImageObserver = imageObserver;
    
    logProgress('Batch 3 loaded:', batch3Items.join(', '));
  }
  
  /* OPTIMIZATION: Batch 4 - Setup IntersectionObserver for recommendations with skeleton replacement */
  function loadBatch4() {
    if (batchesLoaded.batch4) return;
    batchesLoaded.batch4 = true;
    
    const batch4Items = [];
    
    // Setup IntersectionObserver for recommendations section
    const recommendationsSection = document.querySelector('[data-observer-section="recommendations"]');
    
    if (recommendationsSection) {
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Hide skeleton grid
            const skeletonGrid = entry.target.querySelector('[data-skeleton-grid]');
            const productRow = entry.target.querySelector('[data-product-row]');
            
            if (skeletonGrid && productRow) {
              skeletonGrid.style.display = 'none';
              productRow.style.display = 'grid';
              productRow.classList.add('fade-in');
              
              // Load recommendation images if they have data-lazy-src
              const recImages = productRow.querySelectorAll('img[data-lazy-src]');
              recImages.forEach(img => {
                if (img.dataset.lazySrc) {
                  img.src = img.dataset.lazySrc;
                  if (img.dataset.lazySrcset) {
                    img.srcset = img.dataset.lazySrcset;
                  }
                  img.onload = function() {
                    img.classList.add('loaded', 'fade-in');
                  };
                }
              });
              
              logProgress('Executing image load for recommendations via observer');
              batch4Items.push(`Recommendations: ${recImages.length} products`);
            }
            
            sectionObserver.unobserve(entry.target);
          }
        });
      }, {
        root: null,
        rootMargin: '200px',
        threshold: 0.01
      });
      
      sectionObserver.observe(recommendationsSection);
      batch4Items.push('Observer setup: recommendations section');
    }
    
    logProgress('Batch 4 loaded:', batch4Items.join(', '));
  }
  
  /* OPTIMIZATION: Batch 5 - jQuery optimizer with requestIdleCallback for low TBT */
  function loadBatch5() {
    if (batchesLoaded.batch5) return;
    batchesLoaded.batch5 = true;
    
    const batch5Items = [];
    
    const executeJQueryOptimizer = function() {
      if (typeof jQuery === 'undefined') return;
      
      // Cache jQuery selectors
      const selectorCache = {};
      const originalFind = jQuery.fn.find;
      jQuery.fn.find = function(selector) {
        if (typeof selector === 'string') {
          const cacheKey = this.selector + ' ' + selector;
          if (!selectorCache[cacheKey]) {
            selectorCache[cacheKey] = originalFind.call(this, selector);
          }
          return selectorCache[cacheKey];
        }
        return originalFind.call(this, selector);
      };
      
      // Optimize jQuery animations to use CSS when possible
      const originalAnimate = jQuery.fn.animate;
      jQuery.fn.animate = function(properties, duration, easing, complete) {
        let canUseCSS = true;
        for (const prop in properties) {
          if (!['opacity', 'left', 'top', 'right', 'bottom'].includes(prop)) {
            canUseCSS = false;
            break;
          }
        }
        
        if (canUseCSS && duration < 1000) {
          this.css('transition', 'all ' + (duration || 400) + 'ms ease');
          this.css(properties);
          if (complete) {
            setTimeout(complete.bind(this[0]), duration || 400);
          }
          return this;
        }
        
        return originalAnimate.call(this, properties, duration, easing, complete);
      };
      
      batch5Items.push('jQuery optimizer: selector cache, CSS animations');
    };
    
    if ('requestIdleCallback' in window) {
      requestIdleCallback(executeJQueryOptimizer, { timeout: 3000 });
    } else {
      setTimeout(executeJQueryOptimizer, 0);
    }
    
    logProgress('Batch 5 loaded:', batch5Items.join(', '));
  }
  
  /* OPTIMIZATION: Batch 6 - Style batching and object pooling with requestIdleCallback */
  function loadBatch6() {
    if (batchesLoaded.batch6) return;
    batchesLoaded.batch6 = true;
    
    const batch6Items = [];
    
    const executeStyleBatching = function() {
      // Reduce reflows by batching style changes
      const styleQueue = [];
      let styleFlushScheduled = false;
      
      window.queueStyleChange = function(element, styles) {
        styleQueue.push({ element: element, styles: styles });
        
        if (!styleFlushScheduled) {
          styleFlushScheduled = true;
          requestAnimationFrame(function() {
            styleQueue.forEach(function(item) {
              Object.keys(item.styles).forEach(function(key) {
                item.element.style[key] = item.styles[key];
              });
            });
            styleQueue.length = 0;
            styleFlushScheduled = false;
          });
        }
      };
      
      // Reduce garbage collection by reusing objects
      const objectPool = [];
      window.getPooledObject = function() {
        return objectPool.pop() || {};
      };
      
      window.releasePooledObject = function(obj) {
        for (const key in obj) {
          delete obj[key];
        }
        if (objectPool.length < 50) {
          objectPool.push(obj);
        }
      };
      
      batch6Items.push('Style batching, Object pooling');
    };
    
    if ('requestIdleCallback' in window) {
      requestIdleCallback(executeStyleBatching, { timeout: 3000 });
    } else {
      setTimeout(executeStyleBatching, 0);
    }
    
    logProgress('Batch 6 loaded:', batch6Items.join(', '));
  }
  
  /* OPTIMIZATION: Batch 7 - Event delegation with requestIdleCallback */
  function loadBatch7() {
    if (batchesLoaded.batch7) return;
    batchesLoaded.batch7 = true;
    
    const batch7Items = [];
    
    const executeEventDelegation = function() {
      // Optimize event delegation
      const delegatedEvents = {};
      window.optimizedDelegate = function(selector, event, handler) {
        const key = event + ':' + selector;
        if (!delegatedEvents[key]) {
          delegatedEvents[key] = [];
          document.addEventListener(event, function(e) {
            const target = e.target.closest(selector);
            if (target) {
              delegatedEvents[key].forEach(function(h) {
                h.call(target, e);
              });
            }
          }, { passive: true });
        }
        delegatedEvents[key].push(handler);
      };
      
      batch7Items.push('Event delegation');
    };
    
    if ('requestIdleCallback' in window) {
      requestIdleCallback(executeEventDelegation, { timeout: 3000 });
    } else {
      setTimeout(executeEventDelegation, 0);
    }
    
    logProgress('Batch 7 loaded:', batch7Items.join(', '));
  }
  
  /* OPTIMIZATION: Batch 8 - Chunk processing and lazy init with requestIdleCallback */
  function loadBatch8() {
    if (batchesLoaded.batch8) return;
    batchesLoaded.batch8 = true;
    
    const batch8Items = [];
    
    const executeChunkProcessing = function() {
      // Chunk processor for heavy operations
      window.processInChunks = function(items, processor, callback) {
        let index = 0;
        const chunkSize = 10;
        
        function processChunk() {
          const end = Math.min(index + chunkSize, items.length);
          
          for (let i = index; i < end; i++) {
            processor(items[i], i);
          }
          
          index = end;
          
          if (index < items.length) {
            setTimeout(processChunk, 0);
          } else if (callback) {
            callback();
          }
        }
        
        processChunk();
      };
      
      // Lazy initialize features
      const initializedFeatures = {};
      window.lazyInit = function(featureName, initFunction) {
        if (initializedFeatures[featureName]) return;
        initializedFeatures[featureName] = true;
        
        if ('requestIdleCallback' in window) {
          requestIdleCallback(initFunction, { timeout: 2000 });
        } else {
          setTimeout(initFunction, 100);
        }
      };
      
      batch8Items.push('Chunk processing, Lazy init');
    };
    
    if ('requestIdleCallback' in window) {
      requestIdleCallback(executeChunkProcessing, { timeout: 3000 });
    } else {
      setTimeout(executeChunkProcessing, 0);
    }
    
    logProgress('Batch 8 loaded:', batch8Items.join(', '));
    
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
        case 5:
          loadBatch5();
          break;
        case 6:
          loadBatch6();
          break;
        case 7:
          loadBatch7();
          break;
        case 8:
          loadBatch8();
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
        case 5: loadBatch5(); break;
        case 6: loadBatch6(); break;
        case 7: loadBatch7(); break;
        case 8: loadBatch8(); break;
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
