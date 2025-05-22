(function(global, factory) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = factory();
  } else if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof exports === "object") {
    exports.AOS = factory();
  } else {
    global.AOS = factory();
  }
})(this, function() {
  // Default settings
  var settings = {
    offset: 120,
    delay: 0,
    duration: 400,
    easing: 'ease',
    once: false,
    disable: false,
    startEvent: 'DOMContentLoaded'
  };

  var elements = [];
  var initialized = false;
  var isOldBrowser = document.all && !window.atob;

  function extend(target, source) {
    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
    return target;
  }

  // Initialize AOS
  function init(options) {
    settings = extend(settings, options || {});
    elements = collectElements();

    if (shouldDisable(settings.disable) || isOldBrowser) {
      reset();
    } else {
      prepareBody();
      setupEvents();
    }

    return elements;
  }

  function shouldDisable(disableOption) {
    if (disableOption === true) return true;
    if (disableOption === 'mobile') return isMobile();
    if (typeof disableOption === 'function') return disableOption();
    return false;
  }

  function collectElements() {
    var nodes = document.querySelectorAll('[data-aos]');
    var collection = [];

    for (var i = 0; i < nodes.length; i++) {
      collection.push({
        node: nodes[i],
        position: nodes[i].getBoundingClientRect().top
      });
    }

    return collection;
  }

  function prepareBody() {
    document.body.setAttribute('data-aos-easing', settings.easing);
    document.body.setAttribute('data-aos-duration', settings.duration);
    document.body.setAttribute('data-aos-delay', settings.delay);
  }

  function setupEvents() {
    var runRefresh = throttle(refresh, 50);
    var runAnimate = throttle(animateElements, 99);

    document.addEventListener(settings.startEvent, function() {
      refresh(true);
    });

    window.addEventListener('resize', runRefresh);
    window.addEventListener('orientationchange', runRefresh);
    window.addEventListener('scroll', runAnimate);
  }

  function animateElements() {
    elements.forEach(function(el) {
      var rect = el.node.getBoundingClientRect();
      if (rect.top < window.innerHeight - settings.offset) {
        el.node.classList.add('aos-animate');
      } else if (!settings.once) {
        el.node.classList.remove('aos-animate');
      }
    });
  }

  function refresh(hard) {
    if (hard) {
      elements = collectElements();
    }
    animateElements();
  }

  function reset() {
    elements.forEach(function(el) {
      el.node.removeAttribute('data-aos');
      el.node.classList.remove('aos-animate');
    });
  }

  function isMobile() {
    return /Mobi|Android/i.test(navigator.userAgent);
  }

  function throttle(func, limit) {
    var inThrottle;
    return function() {
      var args = arguments;
      var context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(function() {
          inThrottle = false;
        }, limit);
      }
    };
  }

  return {
    init: init,
    refresh: refresh,
    refreshHard: function() {
      elements = collectElements();
      animateElements();
    }
  };
});
