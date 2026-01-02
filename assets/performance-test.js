/**
 * Performance Testing and Verification Script
 * Measures Core Web Vitals and performance improvements
 */

(function() {
  'use strict';
  
  // Performance metrics tracking
  var metrics = {
    navigationStart: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    firstInputDelay: 0,
    cumulativeLayoutShift: 0,
    totalBlockingTime: 0,
    loadTime: 0
  };
  
  /**
   * Measure Navigation Timing
   */
  function measureNavigationTiming() {
    if (!performance.timing) return;
    
    var timing = performance.timing;
    metrics.navigationStart = timing.navigationStart;
    metrics.loadTime = timing.loadEventEnd - timing.navigationStart;
    
    console.log('🚀 Navigation Timing Metrics:');
    console.log('Load Time:', metrics.loadTime + 'ms');
    console.log('DOM Interactive:', timing.domInteractive - timing.navigationStart + 'ms');
    console.log('DOM Complete:', timing.domComplete - timing.navigationStart + 'ms');
  }
  
  /**
   * Measure First Contentful Paint
   */
  function measureFCP() {
    if (!('PerformanceObserver' in window)) return;
    
    var observer = new PerformanceObserver(function(list) {
      var entries = list.getEntries();
      entries.forEach(function(entry) {
        if (entry.name === 'first-contentful-paint') {
          metrics.firstContentfulPaint = entry.startTime;
          console.log('🎨 First Contentful Paint:', metrics.firstContentfulPaint + 'ms');
          
          // Target: <1.5s for mobile
          if (metrics.firstContentfulPaint < 1500) {
            console.log('✅ FCP target achieved!');
          } else {
            console.log('⚠️ FCP above target, needs more optimization');
          }
        }
      });
    });
    
    observer.observe({ entryTypes: ['paint'] });
  }
  
  /**
   * Measure Largest Contentful Paint
   */
  function measureLCP() {
    if (!('PerformanceObserver' in window)) return;
    
    var observer = new PerformanceObserver(function(list) {
      var entries = list.getEntries();
      var lastEntry = entries[entries.length - 1];
      metrics.largestContentfulPaint = lastEntry.startTime;
      
      console.log('🖼️ Largest Contentful Paint:', metrics.largestContentfulPaint + 'ms');
      console.log('LCP Element:', lastEntry.element);
      
      // Target: <2.5s for mobile
      if (metrics.largestContentfulPaint < 2500) {
        console.log('✅ LCP target achieved!');
      } else {
        console.log('⚠️ LCP above target, needs more optimization');
      }
    });
    
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  }
  
  /**
   * Measure First Input Delay
   */
  function measureFID() {
    if (!('PerformanceObserver' in window)) return;
    
    var observer = new PerformanceObserver(function(list) {
      var entries = list.getEntries();
      entries.forEach(function(entry) {
        if (entry.name === 'first-input') {
          metrics.firstInputDelay = entry.processingStart - entry.startTime;
          console.log('⚡ First Input Delay:', metrics.firstInputDelay + 'ms');
          
          // Target: <100ms
          if (metrics.firstInputDelay < 100) {
            console.log('✅ FID target achieved!');
          } else {
            console.log('⚠️ FID above target, needs more optimization');
          }
        }
      });
    });
    
    observer.observe({ entryTypes: ['first-input'] });
  }
  
  /**
   * Measure Cumulative Layout Shift
   */
  function measureCLS() {
    if (!('PerformanceObserver' in window)) return;
    
    var clsValue = 0;
    var observer = new PerformanceObserver(function(list) {
      list.getEntries().forEach(function(entry) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      
      metrics.cumulativeLayoutShift = clsValue;
      console.log('📐 Cumulative Layout Shift:', metrics.cumulativeLayoutShift);
      
      // Target: <0.1
      if (metrics.cumulativeLayoutShift < 0.1) {
        console.log('✅ CLS target achieved!');
      } else {
        console.log('⚠️ CLS above target, needs more optimization');
      }
    });
    
    observer.observe({ entryTypes: ['layout-shift'] });
  }
  
  /**
   * Measure Total Blocking Time
   */
  function measureTBT() {
    if (!('PerformanceObserver' in window)) return;
    
    var tbtValue = 0;
    var fcp = 0;
    
    // Get FCP first
    var paintObserver = new PerformanceObserver(function(list) {
      list.getEntries().forEach(function(entry) {
        if (entry.name === 'first-contentful-paint') {
          fcp = entry.startTime;
        }
      });
    });
    paintObserver.observe({ entryTypes: ['paint'] });
    
    // Measure long tasks
    var observer = new PerformanceObserver(function(list) {
      list.getEntries().forEach(function(entry) {
        if (entry.startTime >= fcp) {
          var blockingTime = entry.duration - 50;
          if (blockingTime > 0) {
            tbtValue += blockingTime;
          }
        }
      });
      
      metrics.totalBlockingTime = tbtValue;
      console.log('🚫 Total Blocking Time:', metrics.totalBlockingTime + 'ms');
      
      // Target: <200ms
      if (metrics.totalBlockingTime < 200) {
        console.log('✅ TBT target achieved!');
      } else {
        console.log('⚠️ TBT above target, needs more optimization');
      }
    });
    
    observer.observe({ entryTypes: ['longtask'] });
  }
  
  /**
   * Analyze resource loading
   */
  function analyzeResources() {
    if (!performance.getEntriesByType) return;
    
    var resources = performance.getEntriesByType('resource');
    var resourceStats = {
      total: resources.length,
      imageSize: 0,
      scriptSize: 0,
      cssSize: 0,
      fontSize: 0,
      blockedResources: 0
    };
    
    resources.forEach(function(resource) {
      var size = resource.transferSize || 0;
      
      if (resource.initiatorType === 'img') {
        resourceStats.imageSize += size;
      } else if (resource.initiatorType === 'script') {
        resourceStats.scriptSize += size;
      } else if (resource.initiatorType === 'link') {
        resourceStats.cssSize += size;
      } else if (resource.initiatorType === 'css') {
        resourceStats.cssSize += size;
      } else if (resource.initiatorType === 'font') {
        resourceStats.fontSize += size;
      }
      
      // Check for render-blocking resources
      if (resource.renderBlockingStatus === 'blocking') {
        resourceStats.blockedResources++;
      }
    });
    
    console.log('📊 Resource Analysis:');
    console.log('Total Resources:', resourceStats.total);
    console.log('Image Size:', (resourceStats.imageSize / 1024).toFixed(2) + ' KB');
    console.log('Script Size:', (resourceStats.scriptSize / 1024).toFixed(2) + ' KB');
    console.log('CSS Size:', (resourceStats.cssSize / 1024).toFixed(2) + ' KB');
    console.log('Font Size:', (resourceStats.fontSize / 1024).toFixed(2) + ' KB');
    console.log('Blocked Resources:', resourceStats.blockedResources);
    
    return resourceStats;
  }
  
  /**
   * Generate performance report
   */
  function generateReport() {
    console.log('\n📋 PERFORMANCE REPORT');
    console.log('==================');
    
    var isMobile = window.innerWidth <= 768;
    console.log('Device Type:', isMobile ? 'Mobile' : 'Desktop');
    
    // Core Web Vitals
    console.log('\n🎯 Core Web Vitals:');
    console.log('FCP:', metrics.firstContentfulPaint + 'ms (Target: <1500ms)');
    console.log('LCP:', metrics.largestContentfulPaint + 'ms (Target: <2500ms)');
    console.log('FID:', metrics.firstInputDelay + 'ms (Target: <100ms)');
    console.log('CLS:', metrics.cumulativeLayoutShift + ' (Target: <0.1)');
    console.log('TBT:', metrics.totalBlockingTime + 'ms (Target: <200ms)');
    
    // Overall score
    var score = 0;
    if (metrics.firstContentfulPaint < 1500) score++;
    if (metrics.largestContentfulPaint < 2500) score++;
    if (metrics.firstInputDelay < 100) score++;
    if (metrics.cumulativeLayoutShift < 0.1) score++;
    if (metrics.totalBlockingTime < 200) score++;
    
    console.log('\n🏆 Overall Score:', score + '/5');
    
    if (score === 5) {
      console.log('🎉 Excellent! All targets achieved!');
    } else if (score >= 3) {
      console.log('👍 Good! Most targets achieved.');
    } else {
      console.log('⚠️ Needs improvement. Check individual metrics.');
    }
    
    // Resource analysis
    analyzeResources();
    
    return {
      metrics: metrics,
      score: score,
      deviceType: isMobile ? 'mobile' : 'desktop'
    };
  }
  
  /**
   * Initialize performance monitoring
   */
  function init() {
    console.log('🔍 Starting Performance Analysis...');
    
    // Start measurements
    measureNavigationTiming();
    measureFCP();
    measureLCP();
    measureFID();
    measureCLS();
    measureTBT();
    
    // Generate report after page load
    window.addEventListener('load', function() {
      setTimeout(function() {
        generateReport();
      }, 1000);
    });
  }
  
  // Start monitoring
  init();
  
  // Expose for manual testing
  window.performanceReport = generateReport;
  
})();
