/**
 * Mobile Performance Optimizer for Shopialo.com
 * Target: <1.5s load time on mobile
 * Focus: LCP, FCP, TBT, CLS optimizations
 */

(function() {
  'use strict';
  
  // Mobile detection
  var isMobile = window.innerWidth <= 768;
  var isSlowConnection = navigator.connection && 
    (navigator.connection.effectiveType === 'slow-2g' || 
     navigator.connection.effectiveType === '2g' || 
     navigator.connection.effectiveType === '3g');
  
  // Performance budget - more aggressive on mobile
  var BUDGET = {
    mobile: {
      scriptDelay: isSlowConnection ? 8000 : 3000,
      imageDelay: 2000,
      animationDelay: 4000
    },
    desktop: {
      scriptDelay: 1000,
      imageDelay: 500,
      animationDelay: 2000
    }
  };
  
  var budget = isMobile ? BUDGET.mobile : BUDGET.desktop;
  
  /**
   * Defer non-critical third-party scripts
   */
  function deferThirdPartyScripts() {
    var scriptsToDefer = [
      'googletagmanager.com',
      'facebook.com/tr',
      'clarity.ms',
      'autoketing.org',
      'hextom.com'
    ];
    
    // Don't defer essential Shopify scripts
    var essentialScripts = [
      'shopify.com',
      'personalizer.io',
      'cdn.shopify.com'
    ];
    
    var deferScript = function(script) {
      if (!script.src) return false;
      
      // Don't defer essential scripts
      for (var i = 0; i < essentialScripts.length; i++) {
        if (script.src.indexOf(essentialScripts[i]) !== -1) {
          return false;
        }
      }
      
      for (var i = 0; i < scriptsToDefer.length; i++) {
        if (script.src.indexOf(scriptsToDefer[i]) !== -1) {
          // Clone and defer the script
          var deferredScript = document.createElement('script');
          deferredScript.src = script.src;
          deferredScript.async = true;
          deferredScript.defer = true;
          
          // Copy attributes
          for (var j = 0; j < script.attributes.length; j++) {
            var attr = script.attributes[j];
            if (attr.name !== 'src') {
              deferredScript.setAttribute(attr.name, attr.value);
            }
          }
          
          // Remove original and add deferred version
          script.parentNode.removeChild(script);
          setTimeout(function() {
            document.head.appendChild(deferredScript);
          }, budget.scriptDelay);
          
          return true;
        }
      }
      return false;
    };
    
    // Process existing scripts
    var scripts = document.querySelectorAll('script[src]');
    scripts.forEach(deferScript);
    
    // Intercept new script additions - be less aggressive
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.tagName === 'SCRIPT' && node.src) {
            deferScript(node);
          }
        });
      });
    });
    
    observer.observe(document.head, { childList: true, subtree: true });
    setTimeout(function() { observer.disconnect(); }, 5000); // Shorter observation time
  }
  
  /**
   * Optimize images with intersection observer
   */
  function optimizeImages() {
    if (!('IntersectionObserver' in window)) return;
    
    var imageObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          
          // Only optimize images that aren't already optimized
          if (!img.hasAttribute('data-optimized')) {
            img.setAttribute('data-optimized', 'true');
            
            // Add loading="lazy" if not present and not eager
            if (!img.hasAttribute('loading') && img.loading !== 'eager') {
              img.setAttribute('loading', 'lazy');
            }
            
            // Optimize srcset for responsive images
            if (img.src && !img.srcset && img.src.includes('cdn.shopify.com')) {
              var baseSrc = img.src.split('?')[0];
              var newSrcset = baseSrc + '?width=245 245w,' + 
                             baseSrc + '?width=490 490w,' + 
                             baseSrc + '?width=735 735w';
              img.setAttribute('srcset', newSrcset);
              img.setAttribute('sizes', '(max-width: 600px) 245px, 490px');
            }
          }
          
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px'
    });
    
    // Observe all images
    document.addEventListener('DOMContentLoaded', function() {
      var images = document.querySelectorAll('img');
      images.forEach(function(img) {
        if (!img.hasAttribute('data-optimized')) {
          imageObserver.observe(img);
        }
      });
    });
  }
  
  /**
   * Reduce JavaScript execution time
   */
  function reduceJavaScriptTime() {
    // Defer heavy computations
    setTimeout(function() {
      // Initialize any heavy libraries after delay
      if (window.Swiper) {
        // Swiper is loaded, initialize if needed
        var swiperElements = document.querySelectorAll('.swiper');
        swiperElements.forEach(function(element) {
          if (!element.swiper) {
            // Initialize Swiper if not already done
          }
        });
      }
    }, budget.scriptDelay);
    
    // Throttle scroll events
    var throttle = function(func, limit) {
      var inThrottle;
      return function() {
        var args = arguments;
        var context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(function() { inThrottle = false; }, limit);
        }
      };
    };
    
    // Throttle scroll events for better performance
    window.addEventListener('scroll', throttle(function() {
      // Scroll handling code here
    }, 100));
  }
  
  /**
   * Font loading optimization
   */
  function optimizeFontLoading() {
    // Ensure fonts are loaded with font-display: swap
    var styleSheets = document.styleSheets;
    for (var i = 0; i < styleSheets.length; i++) {
      try {
        var rules = styleSheets[i].cssRules || styleSheets[i].rules;
        for (var j = 0; j < rules.length; j++) {
          if (rules[j].type === CSSRule.FONT_FACE_RULE) {
            if (!rules[j].style.getPropertyValue('font-display')) {
              rules[j].style.setProperty('font-display', 'swap');
            }
          }
        }
      } catch (e) {
        // Cross-origin stylesheet, skip
      }
    }
  }
  
  /**
   * Critical resource preloading
   */
  function preloadCriticalResources() {
    // Preload critical CSS
    var criticalCSS = [
      '{{ "theme.css" | asset_url }}',
      '{{ "fonts.css" | asset_url }}'
    ];
    
    criticalCSS.forEach(function(url) {
      var link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = url;
      link.onload = function() { this.rel = 'stylesheet'; };
      document.head.appendChild(link);
    });
  }
  
  /**
   * Initialize all optimizations
   */
  function init() {
    // Run immediately
    deferThirdPartyScripts();
    optimizeFontLoading();
    preloadCriticalResources();
    
    // Run after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        optimizeImages();
        reduceJavaScriptTime();
      });
    } else {
      optimizeImages();
      reduceJavaScriptTime();
    }
  }
  
  // Start optimizations
  init();
  
})();
