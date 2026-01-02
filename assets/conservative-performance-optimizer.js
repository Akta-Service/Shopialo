/**
 * Conservative Mobile Performance Optimizer
 * Fixes TBT issues while maintaining functionality
 */

(function() {
  'use strict';
  
  // Mobile detection
  var isMobile = window.innerWidth <= 768;
  var isSlowConnection = navigator.connection && 
    (navigator.connection.effectiveType === 'slow-2g' || 
     navigator.connection.effectiveType === '2g' || 
     navigator.connection.effectiveType === '3g');
  
  // More conservative timing budget
  var BUDGET = {
    mobile: {
      scriptDelay: isSlowConnection ? 6000 : 4000,  // Increased delay
      imageDelay: 1000,
      animationDelay: 3000
    },
    desktop: {
      scriptDelay: 2000,
      imageDelay: 500,
      animationDelay: 1500
    }
  };
  
  var budget = isMobile ? BUDGET.mobile : BUDGET.desktop;
  
  /**
   * Defer only truly non-essential third-party scripts
   */
  function deferNonEssentialScripts() {
    var scriptsToDefer = [
      'googletagmanager.com',
      'facebook.com/tr',
      'clarity.ms',
      'autoketing.org',
      'hextom.com'
    ];
    
    // Essential scripts that should NEVER be deferred
    var essentialScripts = [
      'shopify.com',
      'personalizer.io',
      'cdn.shopify.com',
      'shopifycdn.com'
    ];
    
    var deferScript = function(script) {
      if (!script.src) return false;
      
      // Check if it's essential - don't defer
      for (var i = 0; i < essentialScripts.length; i++) {
        if (script.src.indexOf(essentialScripts[i]) !== -1) {
          return false;
        }
      }
      
      // Check if it should be deferred
      for (var i = 0; i < scriptsToDefer.length; i++) {
        if (script.src.indexOf(scriptsToDefer[i]) !== -1) {
          // Only defer if not already loaded
          if (script.parentNode) {
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
              if (document.head && !document.querySelector('script[src="' + deferredScript.src + '"]')) {
                document.head.appendChild(deferredScript);
              }
            }, budget.scriptDelay);
            
            return true;
          }
        }
      }
      return false;
    };
    
    // Wait for DOM to be ready before processing
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
          var scripts = document.querySelectorAll('script[src]');
          scripts.forEach(deferScript);
        }, 1000);
      });
    } else {
      setTimeout(function() {
        var scripts = document.querySelectorAll('script[src]');
        scripts.forEach(deferScript);
      }, 1000);
    }
  }
  
  /**
   * Optimize images more conservatively
   */
  function optimizeImages() {
    if (!('IntersectionObserver' in window)) return;
    
    var imageObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          
          // Only optimize images that aren't already optimized
          if (!img.hasAttribute('data-optimized') && img.src) {
            img.setAttribute('data-optimized', 'true');
            
            // Add loading="lazy" only if not already set and not critical
            if (!img.hasAttribute('loading') && 
                img.loading !== 'eager' && 
                !img.classList.contains('site-logo-image')) {
              img.setAttribute('loading', 'lazy');
            }
          }
          
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '100px'  // Larger margin for better UX
    });
    
    // Observe images after a short delay
    setTimeout(function() {
      var images = document.querySelectorAll('img');
      images.forEach(function(img) {
        if (!img.hasAttribute('data-optimized')) {
          imageObserver.observe(img);
        }
      });
    }, 2000);
  }
  
  /**
   * Reduce JavaScript execution time more gently
   */
  function reduceJavaScriptTime() {
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
    
    // Throttle scroll events with longer timeout
    window.addEventListener('scroll', throttle(function() {
      // Scroll handling code here
    }, 200));
    
    // Defer heavy operations
    setTimeout(function() {
      // Initialize any heavy libraries after delay
      if (window.Swiper && typeof window.Swiper !== 'undefined') {
        // Swiper is loaded, initialize if needed
        try {
          // Only initialize if not already done
          if (!document.querySelector('.swiper').swiper) {
            // Let Swiper initialize naturally
          }
        } catch (e) {
          console.log('Swiper initialization deferred');
        }
      }
    }, budget.scriptDelay);
  }
  
  /**
   * Font loading optimization - conservative approach
   */
  function optimizeFontLoading() {
    // Only optimize fonts that are already loaded
    setTimeout(function() {
      var styleSheets = document.styleSheets;
      for (var i = 0; i < styleSheets.length; i++) {
        try {
          var rules = styleSheets[i].cssRules || styleSheets[i].rules;
          for (var j = 0; j < rules.length; j++) {
            if (rules[j].type === CSSRule.FONT_FACE_RULE) {
              if (!rules[j].style.getPropertyValue('font-display')) {
                try {
                  rules[j].style.setProperty('font-display', 'swap');
                } catch (e) {
                  // Cross-origin stylesheet, skip
                }
              }
            }
          }
        } catch (e) {
          // Cross-origin stylesheet, skip
        }
      }
    }, 3000);
  }
  
  /**
   * Initialize all optimizations conservatively
   */
  function init() {
    // Run immediately but gently
    setTimeout(function() {
      deferNonEssentialScripts();
    }, 2000);
    
    optimizeFontLoading();
    
    // Run after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
          optimizeImages();
          reduceJavaScriptTime();
        }, 1000);
      });
    } else {
      setTimeout(function() {
        optimizeImages();
        reduceJavaScriptTime();
      }, 1000);
    }
  }
  
  // Start optimizations with delay
  setTimeout(init, 1000);
  
})();
