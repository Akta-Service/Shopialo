/**
 * Deferred Resource Loader for Shopialo.com
 * Loads header and basic layout instantly (<1s)
 * Defers all other resources (JS, CSS, images, animations) by 3 seconds after page load
 * Includes comprehensive console logging
 */

(function() {
  'use strict';
  
  console.log('🚀 [Deferred Loader] Script initialized');
  
  // Device detection
  var isMobile = window.innerWidth <= 768;
  var deviceType = isMobile ? 'Mobile' : 'Desktop';
  
  console.log('📱 [Deferred Loader] Device detected:', deviceType);
  
  // Configuration
  var DELAY_AFTER_LOAD = 10000; // 3 seconds after page load
  var pageLoadComplete = false;
  var deferredResources = {
    scripts: [],
    stylesheets: [],
    images: [],
    animations: [],
    thirdParty: []
  };
  
  /**
   * Check if page has finished loading
   */
  function isPageLoaded() {
    return document.readyState === 'complete';
  }
  
  /**
   * Wait for page load to complete
   */
  function waitForPageLoad(callback) {
    if (isPageLoaded()) {
      console.log('✅ [Deferred Loader] Page already loaded, proceeding immediately');
      callback();
    } else {
      console.log('⏳ [Deferred Loader] Waiting for page load to complete...');
      window.addEventListener('load', function() {
        console.log('✅ [Deferred Loader] Page load complete!');
        pageLoadComplete = true;
        callback();
      });
    }
  }
  
  /**
   * Identify critical resources that should load immediately
   */
  function isCriticalResource(element) {
    var src = element.src || element.href || '';
    var classList = element.classList || [];
    
    // Critical: Header, logo, critical CSS
    if (classList.contains('site-header') || 
        classList.contains('site-logo-image') ||
        src.includes('theme.css') ||
        src.includes('fonts.css')) {
      return true;
    }
    
    // Critical: First viewport image (LCP)
    if (element.tagName === 'IMG') {
      var rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.top >= 0) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Defer non-critical third-party scripts
   */
  function deferThirdPartyScripts() {
    console.log('🔍 [Deferred Loader] Scanning for third-party scripts...');
    
    var thirdPartyDomains = [
      'googletagmanager.com',
      'google-analytics.com',
      'facebook.com',
      'facebook.net',
      'clarity.ms',
      'autoketing.org',
      'hextom.com',
      'personalizer.io',
      'plerdy.com',
      'limespot.com'
    ];
    
    var scripts = document.querySelectorAll('script[src]');
    var deferredCount = 0;
    
    scripts.forEach(function(script) {
      if (!script.src) return;
      
      var shouldDefer = false;
      var matchedDomain = '';
      
      for (var i = 0; i < thirdPartyDomains.length; i++) {
        if (script.src.indexOf(thirdPartyDomains[i]) !== -1) {
          shouldDefer = true;
          matchedDomain = thirdPartyDomains[i];
          break;
        }
      }
      
      if (shouldDefer && script.parentNode) {
        console.log('⏸️  [Deferred Loader] Deferring third-party script:', matchedDomain);
        
        var scriptClone = {
          src: script.src,
          attributes: []
        };
        
        for (var j = 0; j < script.attributes.length; j++) {
          var attr = script.attributes[j];
          if (attr.name !== 'src') {
            scriptClone.attributes.push({ name: attr.name, value: attr.value });
          }
        }
        
        deferredResources.thirdParty.push(scriptClone);
        script.parentNode.removeChild(script);
        deferredCount++;
      }
    });
    
    console.log('📊 [Deferred Loader] Deferred ' + deferredCount + ' third-party scripts');
  }
  
  /**
   * Defer non-critical stylesheets
   */
  function deferNonCriticalCSS() {
    console.log('🔍 [Deferred Loader] Scanning for non-critical CSS...');
    
    var nonCriticalCSS = [
      'custom.css',
      'ripple.css',
      'swiper-bundle.min.css'
    ];
    
    var links = document.querySelectorAll('link[rel="stylesheet"]');
    var deferredCount = 0;
    
    links.forEach(function(link) {
      if (!link.href) return;
      
      var shouldDefer = false;
      var matchedFile = '';
      
      for (var i = 0; i < nonCriticalCSS.length; i++) {
        if (link.href.indexOf(nonCriticalCSS[i]) !== -1) {
          shouldDefer = true;
          matchedFile = nonCriticalCSS[i];
          break;
        }
      }
      
      if (shouldDefer && link.parentNode) {
        console.log('⏸️  [Deferred Loader] Deferring CSS:', matchedFile);
        
        deferredResources.stylesheets.push({
          href: link.href,
          media: link.media || 'all'
        });
        
        link.parentNode.removeChild(link);
        deferredCount++;
      }
    });
    
    console.log('📊 [Deferred Loader] Deferred ' + deferredCount + ' stylesheets');
  }
  
  /**
   * Defer below-fold images
   */
  function deferBelowFoldImages() {
    console.log('🔍 [Deferred Loader] Scanning for below-fold images...');
    
    var images = document.querySelectorAll('img');
    var deferredCount = 0;
    var viewportHeight = window.innerHeight;
    
    images.forEach(function(img) {
      if (isCriticalResource(img)) {
        return;
      }
      
      var rect = img.getBoundingClientRect();
      var isAboveFold = rect.top < viewportHeight;
      
      if (!isAboveFold && img.src && !img.hasAttribute('data-deferred')) {
        console.log('⏸️  [Deferred Loader] Deferring image:', img.src.substring(0, 60) + '...');
        
        deferredResources.images.push({
          element: img,
          src: img.src,
          srcset: img.srcset || ''
        });
        
        img.setAttribute('data-deferred', 'true');
        img.setAttribute('data-original-src', img.src);
        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
        if (img.srcset) {
          img.removeAttribute('srcset');
        }
        
        deferredCount++;
      }
    });
    
    console.log('📊 [Deferred Loader] Deferred ' + deferredCount + ' below-fold images');
  }
  
  /**
   * Defer animations and transitions
   */
  function deferAnimations() {
    console.log('🔍 [Deferred Loader] Deferring animations...');
    
    var animatedElements = document.querySelectorAll('[class*="animate"], [class*="fade"], [class*="slide"]');
    var deferredCount = 0;
    
    animatedElements.forEach(function(element) {
      var classes = element.className;
      if (classes && typeof classes === 'string') {
        element.setAttribute('data-deferred-animation', classes);
        element.className = classes.replace(/animate-\S+|fade-\S+|slide-\S+/g, '');
        deferredCount++;
      }
    });
    
    console.log('📊 [Deferred Loader] Deferred ' + deferredCount + ' animations');
  }
  
  /**
   * Load deferred third-party scripts
   */
  function loadDeferredScripts() {
    console.log('🔄 [Deferred Loader] Loading deferred third-party scripts...');
    
    deferredResources.thirdParty.forEach(function(scriptData, index) {
      setTimeout(function() {
        console.log('✅ [Deferred Loader] Loading script ' + (index + 1) + '/' + deferredResources.thirdParty.length + ':', scriptData.src.substring(0, 60) + '...');
        
        var script = document.createElement('script');
        script.src = scriptData.src;
        script.async = true;
        script.defer = true;
        
        scriptData.attributes.forEach(function(attr) {
          script.setAttribute(attr.name, attr.value);
        });
        
        document.head.appendChild(script);
      }, index * 200); // Stagger loading by 200ms
    });
  }
  
  /**
   * Load deferred stylesheets
   */
  function loadDeferredCSS() {
    console.log('🔄 [Deferred Loader] Loading deferred stylesheets...');
    
    deferredResources.stylesheets.forEach(function(cssData, index) {
      setTimeout(function() {
        console.log('✅ [Deferred Loader] Loading CSS ' + (index + 1) + '/' + deferredResources.stylesheets.length + ':', cssData.href.substring(cssData.href.lastIndexOf('/') + 1));
        
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssData.href;
        link.media = cssData.media;
        
        document.head.appendChild(link);
      }, index * 100); // Stagger loading by 100ms
    });
  }
  
  /**
   * Load deferred images
   */
  function loadDeferredImages() {
    console.log('🔄 [Deferred Loader] Loading deferred images...');
    
    deferredResources.images.forEach(function(imgData, index) {
      setTimeout(function() {
        var img = imgData.element;
        if (img && img.getAttribute('data-deferred')) {
          console.log('✅ [Deferred Loader] Loading image ' + (index + 1) + '/' + deferredResources.images.length);
          
          img.src = imgData.src;
          if (imgData.srcset) {
            img.srcset = imgData.srcset;
          }
          img.removeAttribute('data-deferred');
        }
      }, index * 50); // Stagger loading by 50ms
    });
  }
  
  /**
   * Restore deferred animations
   */
  function restoreAnimations() {
    console.log('🔄 [Deferred Loader] Restoring animations...');
    
    var animatedElements = document.querySelectorAll('[data-deferred-animation]');
    var restoredCount = 0;
    
    animatedElements.forEach(function(element) {
      var originalClasses = element.getAttribute('data-deferred-animation');
      if (originalClasses) {
        element.className = element.className + ' ' + originalClasses;
        element.removeAttribute('data-deferred-animation');
        restoredCount++;
      }
    });
    
    console.log('✅ [Deferred Loader] Restored ' + restoredCount + ' animations');
  }
  
  /**
   * Load all deferred resources
   */
  function loadDeferredResources() {
    console.log('⏰ [Deferred Loader] Starting 3-second timer...');
    
    setTimeout(function() {
      console.log('🎯 [Deferred Loader] 3 seconds elapsed! Loading all deferred resources...');
      console.log('📦 [Deferred Loader] Resources to load:', {
        'Third-party scripts': deferredResources.thirdParty.length,
        'Stylesheets': deferredResources.stylesheets.length,
        'Images': deferredResources.images.length,
        'Animations': document.querySelectorAll('[data-deferred-animation]').length
      });
      
      loadDeferredScripts();
      loadDeferredCSS();
      loadDeferredImages();
      restoreAnimations();
      
      console.log('✅ [Deferred Loader] All deferred resources are now loading!');
      console.log('🎉 [Deferred Loader] Deferred loading complete!');
    }, DELAY_AFTER_LOAD);
  }
  
  /**
   * Initialize deferred loading
   */
  function init() {
    console.log('🎬 [Deferred Loader] Initializing deferred loading system...');
    console.log('⚙️  [Deferred Loader] Configuration:', {
      'Delay after load': DELAY_AFTER_LOAD + 'ms',
      'Device': deviceType,
      'Screen width': window.innerWidth + 'px'
    });
    
    // Defer resources immediately
    deferThirdPartyScripts();
    deferNonCriticalCSS();
    deferBelowFoldImages();
    deferAnimations();
    
    console.log('✅ [Deferred Loader] Initial deferral complete');
    console.log('⏳ [Deferred Loader] Waiting for page load to complete before starting timer...');
    
    // Wait for page load, then start 3-second timer
    waitForPageLoad(function() {
      console.log('🎯 [Deferred Loader] Page load detected! Starting 3-second countdown...');
      loadDeferredResources();
    });
  }
  
  // Start immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();
