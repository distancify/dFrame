(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
exports.__esModule = true;
/**
 * Calculates whether two elements overlapW
 */
function doOverlap($elem1, $elem2) {
    var getDimensions = function (e) {
        var offset = (e.offset() || { left: 0, top: 0 });
        return {
            top: offset.top,
            left: offset.left,
            width: e.width() || 0,
            height: e.height() || 0
        };
    };
    var e1 = getDimensions($elem1);
    var e2 = getDimensions($elem2);
    var l1 = {
        x: e1.left,
        y: e1.top
    };
    var r1 = {
        x: e1.left + e1.width,
        y: e1.top + e1.height
    };
    var l2 = {
        x: e2.left,
        y: e2.top
    };
    var r2 = {
        x: e2.left + e2.width,
        y: e2.top + e2.height
    };
    var xOverlap = l1.x <= l2.x && r1.x > l2.x || l2.x <= l1.x && r2.x > l1.x;
    var yOverlap = l1.y <= l2.y && r1.y > l2.y || l2.y <= l1.y && r2.y > l1.y;
    return xOverlap && yOverlap;
}
exports.doOverlap = doOverlap;

},{}],2:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var ObservableState_1 = require("./ObservableState");
var selectors = require("./Selectors");
var events = require("./Events");
var navigation = require("./Navigation");
var _states = {
    opened: new ObservableState_1.ObservableState(false),
    page: new ObservableState_1.ObservableState(document.createElement('div'))
};
var _dom = {
    drawerContainer: $('<div id="_dFrame-drawerContainer"><div id="_dFrame-drawerBackground" class="_dFrameTheme-drawerBackground"></div></div>'),
    drawer: $('<div class="_dFrameTheme-drawer" id="_dFrame-drawer"></div>'),
    drawerSpacer: $('<div class="_dFrame-drawerSpacer"></div>')
};
_dom.drawerContainer.appendTo(selectors.header);
_dom.drawerContainer.append(_dom.drawer);
_dom.drawerContainer.click(function (event) {
    event.preventDefault();
    event.stopPropagation();
    _states.opened.set(false);
});
events.documentClick.push(function () { return _states.opened.set(false); });
_states.opened.onChange(function () {
    if (_states.opened.current()) {
        selectors.root.addClass('_dFrameState-drawerOpened');
        navigation.closeNavigationDrawer();
    }
    else {
        _states.page.reset();
        selectors.root.removeClass('_dFrameState-drawerOpened');
    }
    console.log('Drawer expanded/collapsed');
});
_states.page.onChange(function () {
    _dom.drawer.empty();
    if (_states.page.current() == null) {
        return;
    }
    _dom.drawerSpacer.appendTo(_dom.drawer);
    $(_states.page.current()).appendTo(_dom.drawer);
    _states.opened.set(true);
    updateSpacer();
});
function openDrawer(page) {
    // setTimeout is used to avoid that a click that triggered openDrawer to immediately close the drawer if the event is allowed to propagate.
    setTimeout(function () {
        _states.page.set(page.get(0));
    }, 0);
}
exports.openDrawer = openDrawer;
function toggleDrawer(page) {
    if (_states.opened.current()) {
        _states.opened.set(false);
    }
    else {
        openDrawer(page);
    }
}
exports.toggleDrawer = toggleDrawer;
function closeDrawer() {
    _states.opened.set(false);
}
exports.closeDrawer = closeDrawer;
function updateSpacer() {
    var height;
    var $currentPage = _dom.drawer.find('._dFrame-navPage._dFrame-navActive');
    var heightLinks = $currentPage.children('._dFrame-navItems').height() || 0;
    var heightContents = $currentPage.children('._dFrame-navContent').height() || 0;
    if (heightLinks > heightContents) {
        height = heightLinks;
    }
    else {
        height = heightContents;
    }
    _dom.drawerSpacer.height(height);
}

},{"./Events":3,"./Navigation":4,"./ObservableState":5,"./Selectors":6}],3:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.resize = [];
exports.viewportScroll = [];
exports.documentClick = [];
$(function () {
    $(document).on('click', function (e) {
        for (var _i = 0, documentClick_1 = exports.documentClick; _i < documentClick_1.length; _i++) {
            var handler = documentClick_1[_i];
            handler(e);
        }
    });
    $(window).on('resize', function (e) {
        for (var _i = 0, resize_1 = exports.resize; _i < resize_1.length; _i++) {
            var handler = resize_1[_i];
            handler(e);
        }
    });
    $(window).on('scroll', function (e) {
        if (e.target === document) {
            for (var _i = 0, viewportScroll_1 = exports.viewportScroll; _i < viewportScroll_1.length; _i++) {
                var handler = viewportScroll_1[_i];
                handler(e);
            }
        }
    });
});

},{}],4:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var ObservableState_1 = require("./ObservableState");
var selectors = require("./Selectors");
var events = require("./Events");
var domUtils = require("./DomUtils");
var drawer = require("./Drawer");
var _states = {
    hamburgerShown: new ObservableState_1.ObservableState(false),
    navigationExpanded: new ObservableState_1.ObservableState(false)
};
var _dom = {
    hamburger: $('<a class="_dFrameTheme-hamburger" id="_dFrame-hamburger"><span class="_dFrameTheme-hamburgerIcon"/></a>'),
    navigation: $('#_dFrame-navigation'),
    navigationDrawerContainer: $('<div id="_dFrame-navigationDrawerContainer"><div id="_dFrame-navigationDrawerBackground" class="_dFrameTheme-navigationDrawerBackground"></div></div>'),
    navigationDrawer: $('<div class="_dFrameTheme-navigationDrawer" id="_dFrame-navigationDrawer"></div>'),
    drawerSpacer: $('<div class="_dFrame-navDrawerSpacer"></div>')
};
_dom.hamburger.insertAfter(_dom.navigation);
_dom.navigationDrawerContainer.appendTo(selectors.header);
_dom.navigationDrawerContainer.append(_dom.navigationDrawer);
_dom.navigationDrawerContainer.click(function (event) {
    event.preventDefault();
    event.stopPropagation();
    _states.navigationExpanded.set(false);
});
events.documentClick.push(function () { return _states.navigationExpanded.set(false); });
_dom.navigationDrawer.click(function (event) {
    event.stopPropagation();
});
_dom.hamburger.click(function (e) {
    e.stopPropagation();
    e.preventDefault();
    expandNavigation(_dom.navigation);
});
events.resize.push(function () { return updateNavigation(); });
_states.hamburgerShown.onChange(function (s) {
    if (_states.hamburgerShown.current()) {
        selectors.root.addClass('_dFrameState-hamburger');
    }
    else {
        selectors.root.removeClass('_dFrameState-hamburger');
    }
    _states.navigationExpanded.set(false);
});
_states.navigationExpanded.onChange(function () {
    if (_states.navigationExpanded.current()) {
        selectors.root.addClass('_dFrameState-navigationExpanded');
        drawer.closeDrawer();
    }
    else {
        selectors.root.removeClass('_dFrameState-navigationExpanded');
        $('._dFrame-navLink._dFrame-navOpened').removeClass('_dFrame-navOpened');
    }
    console.log('Navigation expanded/collapsed');
});
$('._dFrame-navLink > a').on('click', function (e) {
    if (navigate($(e.target))) {
        e.preventDefault();
        e.stopPropagation();
    }
});
updateNavigation();
function updateNavigation() {
    var overlaps = false;
    _dom.navigation.siblings(':not(#_dFrame-hamburger)').each(function (idx, elem) {
        if (domUtils.doOverlap(_dom.navigation, $(elem))) {
            overlaps = true;
        }
    });
    if (overlaps || ($(window).width() || 0) < 600) {
        _states.hamburgerShown.set(true);
    }
    else {
        _states.hamburgerShown.set(false);
    }
}
function updateSpacer() {
    var height;
    var $currentPage = _dom.navigationDrawer.find('._dFrame-navPage._dFrame-navActive');
    var heightLinks = $currentPage.children('._dFrame-navItems').height() || 0;
    var heightContents = $currentPage.children('._dFrame-navContent').height() || 0;
    if (heightLinks > heightContents) {
        height = heightLinks;
    }
    else {
        height = heightContents;
    }
    _dom.drawerSpacer.height(height);
}
function expandNavigation($root) {
    // TODO Add ._dFrame-navPath to all ._dFrame-navPage that contain a ._dFrame-navActive
    _dom.navigationDrawer.empty();
    var page;
    if ($root == _dom.navigation) {
        page = $('<div class="_dFrame-navPage"/>');
        var links = $root.children("._dFrame-navItems").clone(true, true);
        links.appendTo(page);
        // TODO if $root == this._dom.navigation then fetch footer as content, otherwise fetch content.
    }
    else {
        page = $root.clone(true, true);
    }
    _dom.drawerSpacer.appendTo(_dom.navigationDrawer);
    page.appendTo(_dom.navigationDrawer);
    page.addClass("_dFrame-navActive");
    page.find('._dFrame-navPage').each(function (idx, page) {
        var $page = $(page);
        var parent = $page.parent().closest('._dFrame-navPage');
        var parentTitle = parent.siblings('a').text();
        if ($root == _dom.navigation && !parentTitle) {
            parentTitle = 'Start';
        }
        else if (!parentTitle) {
            parentTitle = $root.siblings('a').text();
        }
        var links = $page.children('._dFrame-navItems');
        var backItem = $('<li class="_dFrameTheme-navCrumbs" />');
        var backLink = $('<a href="#">' + parentTitle + '</a>');
        backLink.appendTo(backItem);
        backItem.prependTo(links);
        backLink.on('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            parent.removeClass('_dFrame-navPath').addClass('_dFrame-navActive');
            $page.removeClass('_dFrame-navActive');
            updateSpacer();
        });
    });
    _states.navigationExpanded.set(true);
    updateSpacer();
}
function navigate($link) {
    var $previousLink = $('._dFrame-navLink._dFrame-navOpened');
    var $currentPage = _dom.navigationDrawerContainer.find('._dFrame-navActive');
    var $subNav = $link.siblings('._dFrame-navPage');
    var hasSubNav = $subNav.length > 0;
    console.log('clicked ' + $link.attr("href") + ", has subnav: " + hasSubNav);
    if (!hasSubNav) {
        // Do not intercept. Let client navigate to link.
        return false;
    }
    if (_states.navigationExpanded.current() && $currentPage.has($link.get(0)).length) {
        $subNav.addClass('_dFrame-navActive');
        $currentPage.removeClass('_dFrame-navActive').addClass('_dFrame-navPath');
    }
    else if ($previousLink.get(0) === $link.parent().get(0)) {
        _states.navigationExpanded.set(false);
    }
    else {
        expandNavigation($subNav);
        $currentPage.removeClass('_dFrame-navActive');
        $previousLink.removeClass('_dFrame-navOpened');
        $link.parent().addClass('_dFrame-navOpened');
        $link.closest('._dFrame-navActive').removeClass('_dFrame-navActive').addClass('_dFrame-navPath');
    }
    updateSpacer();
    return true;
}
exports.navigate = navigate;
function closeNavigationDrawer() {
    _states.navigationExpanded.set(false);
}
exports.closeNavigationDrawer = closeNavigationDrawer;

},{"./DomUtils":1,"./Drawer":2,"./Events":3,"./ObservableState":5,"./Selectors":6}],5:[function(require,module,exports){
"use strict";
/// <referece path="../../typings/index.d.ts"/>
exports.__esModule = true;
var ObservableState = /** @class */ (function () {
    function ObservableState(initialValue) {
        this._handlers = [];
        this._current = initialValue;
        this._default = initialValue;
    }
    ObservableState.prototype.current = function () { return this._current; };
    ObservableState.prototype.set = function (value) {
        if (this._current !== value) {
            this._current = value;
            for (var _i = 0, _a = this._handlers; _i < _a.length; _i++) {
                var handler = _a[_i];
                handler(this._current);
            }
        }
    };
    ObservableState.prototype.reset = function () {
        this._current = this._default;
    };
    ObservableState.prototype.onChange = function (handler) {
        this._handlers.push(handler);
    };
    return ObservableState;
}());
exports.ObservableState = ObservableState;

},{}],6:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.root = $('#_dFrame');
exports.pageNameWrap = $('#_dFrame-pageNameWrap');
exports.pageName = $('#_dFrame-pageName');
exports.header = $('#_dFrame-header');
exports.headerContent = $('#_dFrame-headerContent');
exports.actions = $('#_dFrame-actions');
exports.ribbon = $('#_dFrame-ribbon');

},{}],7:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
exports.__esModule = true;
/// <referece path="../../typings/index.d.ts"/>
var ObservableState_1 = require("./ObservableState");
var selectors = require("./Selectors");
var events = require("./Events");
__export(require("./Navigation"));
__export(require("./Drawer"));
var _states = {
    hamburgerShown: new ObservableState_1.ObservableState(false)
};
var _headerHeight = selectors.header.height() || 0;
var _scrollState = {
    anchor: 0,
    state: 'up'
};
// Spacer behind header to push content down
$('<div/>').height(_headerHeight).insertAfter(selectors.header);
selectors.header.css('position', 'fixed');
events.viewportScroll.push(function (e) {
    updateScrollState();
});
updateScrollState();
function updateScrollState() {
    var current = $(document).scrollTop() || 0;
    var delta = current - _scrollState.anchor;
    if (current > _headerHeight && delta > 50 && _scrollState.state === 'up') {
        selectors.root.addClass('_efwState-scrolledDown');
        _scrollState.state = 'down';
        _scrollState.anchor = $(document).scrollTop() || 0;
        selectors.ribbon.css({ 'margin-top': '-' + selectors.ribbon.height() + 'px' });
    }
    else if ((current < _headerHeight || delta < -100) && _scrollState.state === 'down') {
        selectors.root.removeClass('_efwState-scrolledDown');
        _scrollState.state = 'up';
        _scrollState.anchor = $(document).scrollTop() || 0;
        selectors.ribbon.css({ 'margin-top': '' });
    }
    if (delta > 0 && _scrollState.state === 'down' || delta < 0 && _scrollState.state === 'up') {
        _scrollState.anchor = $(document).scrollTop() || 0;
    }
}

},{"./Drawer":2,"./Events":3,"./Navigation":4,"./ObservableState":5,"./Selectors":6}],8:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var $dFrame = require("./dFrame");
var cartPage = $('<div>Hey!</div>');
$('#jsOpenCart').click(function (e) {
    e.stopPropagation();
    $dFrame.openDrawer(cartPage);
});

},{"./dFrame":7}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkaXN0L3NjcmlwdHMvRG9tVXRpbHMuanMiLCJkaXN0L3NjcmlwdHMvRHJhd2VyLmpzIiwiZGlzdC9zY3JpcHRzL0V2ZW50cy5qcyIsImRpc3Qvc2NyaXB0cy9OYXZpZ2F0aW9uLmpzIiwiZGlzdC9zY3JpcHRzL09ic2VydmFibGVTdGF0ZS5qcyIsImRpc3Qvc2NyaXB0cy9TZWxlY3RvcnMuanMiLCJkaXN0L3NjcmlwdHMvZEZyYW1lLmpzIiwiZGlzdC9zY3JpcHRzL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG4vKipcbiAqIENhbGN1bGF0ZXMgd2hldGhlciB0d28gZWxlbWVudHMgb3ZlcmxhcFdcbiAqL1xuZnVuY3Rpb24gZG9PdmVybGFwKCRlbGVtMSwgJGVsZW0yKSB7XG4gICAgdmFyIGdldERpbWVuc2lvbnMgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICB2YXIgb2Zmc2V0ID0gKGUub2Zmc2V0KCkgfHwgeyBsZWZ0OiAwLCB0b3A6IDAgfSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0b3A6IG9mZnNldC50b3AsXG4gICAgICAgICAgICBsZWZ0OiBvZmZzZXQubGVmdCxcbiAgICAgICAgICAgIHdpZHRoOiBlLndpZHRoKCkgfHwgMCxcbiAgICAgICAgICAgIGhlaWdodDogZS5oZWlnaHQoKSB8fCAwXG4gICAgICAgIH07XG4gICAgfTtcbiAgICB2YXIgZTEgPSBnZXREaW1lbnNpb25zKCRlbGVtMSk7XG4gICAgdmFyIGUyID0gZ2V0RGltZW5zaW9ucygkZWxlbTIpO1xuICAgIHZhciBsMSA9IHtcbiAgICAgICAgeDogZTEubGVmdCxcbiAgICAgICAgeTogZTEudG9wXG4gICAgfTtcbiAgICB2YXIgcjEgPSB7XG4gICAgICAgIHg6IGUxLmxlZnQgKyBlMS53aWR0aCxcbiAgICAgICAgeTogZTEudG9wICsgZTEuaGVpZ2h0XG4gICAgfTtcbiAgICB2YXIgbDIgPSB7XG4gICAgICAgIHg6IGUyLmxlZnQsXG4gICAgICAgIHk6IGUyLnRvcFxuICAgIH07XG4gICAgdmFyIHIyID0ge1xuICAgICAgICB4OiBlMi5sZWZ0ICsgZTIud2lkdGgsXG4gICAgICAgIHk6IGUyLnRvcCArIGUyLmhlaWdodFxuICAgIH07XG4gICAgdmFyIHhPdmVybGFwID0gbDEueCA8PSBsMi54ICYmIHIxLnggPiBsMi54IHx8IGwyLnggPD0gbDEueCAmJiByMi54ID4gbDEueDtcbiAgICB2YXIgeU92ZXJsYXAgPSBsMS55IDw9IGwyLnkgJiYgcjEueSA+IGwyLnkgfHwgbDIueSA8PSBsMS55ICYmIHIyLnkgPiBsMS55O1xuICAgIHJldHVybiB4T3ZlcmxhcCAmJiB5T3ZlcmxhcDtcbn1cbmV4cG9ydHMuZG9PdmVybGFwID0gZG9PdmVybGFwO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xudmFyIE9ic2VydmFibGVTdGF0ZV8xID0gcmVxdWlyZShcIi4vT2JzZXJ2YWJsZVN0YXRlXCIpO1xudmFyIHNlbGVjdG9ycyA9IHJlcXVpcmUoXCIuL1NlbGVjdG9yc1wiKTtcbnZhciBldmVudHMgPSByZXF1aXJlKFwiLi9FdmVudHNcIik7XG52YXIgbmF2aWdhdGlvbiA9IHJlcXVpcmUoXCIuL05hdmlnYXRpb25cIik7XG52YXIgX3N0YXRlcyA9IHtcbiAgICBvcGVuZWQ6IG5ldyBPYnNlcnZhYmxlU3RhdGVfMS5PYnNlcnZhYmxlU3RhdGUoZmFsc2UpLFxuICAgIHBhZ2U6IG5ldyBPYnNlcnZhYmxlU3RhdGVfMS5PYnNlcnZhYmxlU3RhdGUoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykpXG59O1xudmFyIF9kb20gPSB7XG4gICAgZHJhd2VyQ29udGFpbmVyOiAkKCc8ZGl2IGlkPVwiX2RGcmFtZS1kcmF3ZXJDb250YWluZXJcIj48ZGl2IGlkPVwiX2RGcmFtZS1kcmF3ZXJCYWNrZ3JvdW5kXCIgY2xhc3M9XCJfZEZyYW1lVGhlbWUtZHJhd2VyQmFja2dyb3VuZFwiPjwvZGl2PjwvZGl2PicpLFxuICAgIGRyYXdlcjogJCgnPGRpdiBjbGFzcz1cIl9kRnJhbWVUaGVtZS1kcmF3ZXJcIiBpZD1cIl9kRnJhbWUtZHJhd2VyXCI+PC9kaXY+JyksXG4gICAgZHJhd2VyU3BhY2VyOiAkKCc8ZGl2IGNsYXNzPVwiX2RGcmFtZS1kcmF3ZXJTcGFjZXJcIj48L2Rpdj4nKVxufTtcbl9kb20uZHJhd2VyQ29udGFpbmVyLmFwcGVuZFRvKHNlbGVjdG9ycy5oZWFkZXIpO1xuX2RvbS5kcmF3ZXJDb250YWluZXIuYXBwZW5kKF9kb20uZHJhd2VyKTtcbl9kb20uZHJhd2VyQ29udGFpbmVyLmNsaWNrKGZ1bmN0aW9uIChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgX3N0YXRlcy5vcGVuZWQuc2V0KGZhbHNlKTtcbn0pO1xuZXZlbnRzLmRvY3VtZW50Q2xpY2sucHVzaChmdW5jdGlvbiAoKSB7IHJldHVybiBfc3RhdGVzLm9wZW5lZC5zZXQoZmFsc2UpOyB9KTtcbl9zdGF0ZXMub3BlbmVkLm9uQ2hhbmdlKGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoX3N0YXRlcy5vcGVuZWQuY3VycmVudCgpKSB7XG4gICAgICAgIHNlbGVjdG9ycy5yb290LmFkZENsYXNzKCdfZEZyYW1lU3RhdGUtZHJhd2VyT3BlbmVkJyk7XG4gICAgICAgIG5hdmlnYXRpb24uY2xvc2VOYXZpZ2F0aW9uRHJhd2VyKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBfc3RhdGVzLnBhZ2UucmVzZXQoKTtcbiAgICAgICAgc2VsZWN0b3JzLnJvb3QucmVtb3ZlQ2xhc3MoJ19kRnJhbWVTdGF0ZS1kcmF3ZXJPcGVuZWQnKTtcbiAgICB9XG4gICAgY29uc29sZS5sb2coJ0RyYXdlciBleHBhbmRlZC9jb2xsYXBzZWQnKTtcbn0pO1xuX3N0YXRlcy5wYWdlLm9uQ2hhbmdlKGZ1bmN0aW9uICgpIHtcbiAgICBfZG9tLmRyYXdlci5lbXB0eSgpO1xuICAgIGlmIChfc3RhdGVzLnBhZ2UuY3VycmVudCgpID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBfZG9tLmRyYXdlclNwYWNlci5hcHBlbmRUbyhfZG9tLmRyYXdlcik7XG4gICAgJChfc3RhdGVzLnBhZ2UuY3VycmVudCgpKS5hcHBlbmRUbyhfZG9tLmRyYXdlcik7XG4gICAgX3N0YXRlcy5vcGVuZWQuc2V0KHRydWUpO1xuICAgIHVwZGF0ZVNwYWNlcigpO1xufSk7XG5mdW5jdGlvbiBvcGVuRHJhd2VyKHBhZ2UpIHtcbiAgICAvLyBzZXRUaW1lb3V0IGlzIHVzZWQgdG8gYXZvaWQgdGhhdCBhIGNsaWNrIHRoYXQgdHJpZ2dlcmVkIG9wZW5EcmF3ZXIgdG8gaW1tZWRpYXRlbHkgY2xvc2UgdGhlIGRyYXdlciBpZiB0aGUgZXZlbnQgaXMgYWxsb3dlZCB0byBwcm9wYWdhdGUuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIF9zdGF0ZXMucGFnZS5zZXQocGFnZS5nZXQoMCkpO1xuICAgIH0sIDApO1xufVxuZXhwb3J0cy5vcGVuRHJhd2VyID0gb3BlbkRyYXdlcjtcbmZ1bmN0aW9uIHRvZ2dsZURyYXdlcihwYWdlKSB7XG4gICAgaWYgKF9zdGF0ZXMub3BlbmVkLmN1cnJlbnQoKSkge1xuICAgICAgICBfc3RhdGVzLm9wZW5lZC5zZXQoZmFsc2UpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgb3BlbkRyYXdlcihwYWdlKTtcbiAgICB9XG59XG5leHBvcnRzLnRvZ2dsZURyYXdlciA9IHRvZ2dsZURyYXdlcjtcbmZ1bmN0aW9uIGNsb3NlRHJhd2VyKCkge1xuICAgIF9zdGF0ZXMub3BlbmVkLnNldChmYWxzZSk7XG59XG5leHBvcnRzLmNsb3NlRHJhd2VyID0gY2xvc2VEcmF3ZXI7XG5mdW5jdGlvbiB1cGRhdGVTcGFjZXIoKSB7XG4gICAgdmFyIGhlaWdodDtcbiAgICB2YXIgJGN1cnJlbnRQYWdlID0gX2RvbS5kcmF3ZXIuZmluZCgnLl9kRnJhbWUtbmF2UGFnZS5fZEZyYW1lLW5hdkFjdGl2ZScpO1xuICAgIHZhciBoZWlnaHRMaW5rcyA9ICRjdXJyZW50UGFnZS5jaGlsZHJlbignLl9kRnJhbWUtbmF2SXRlbXMnKS5oZWlnaHQoKSB8fCAwO1xuICAgIHZhciBoZWlnaHRDb250ZW50cyA9ICRjdXJyZW50UGFnZS5jaGlsZHJlbignLl9kRnJhbWUtbmF2Q29udGVudCcpLmhlaWdodCgpIHx8IDA7XG4gICAgaWYgKGhlaWdodExpbmtzID4gaGVpZ2h0Q29udGVudHMpIHtcbiAgICAgICAgaGVpZ2h0ID0gaGVpZ2h0TGlua3M7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBoZWlnaHQgPSBoZWlnaHRDb250ZW50cztcbiAgICB9XG4gICAgX2RvbS5kcmF3ZXJTcGFjZXIuaGVpZ2h0KGhlaWdodCk7XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzLnJlc2l6ZSA9IFtdO1xuZXhwb3J0cy52aWV3cG9ydFNjcm9sbCA9IFtdO1xuZXhwb3J0cy5kb2N1bWVudENsaWNrID0gW107XG4kKGZ1bmN0aW9uICgpIHtcbiAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIGRvY3VtZW50Q2xpY2tfMSA9IGV4cG9ydHMuZG9jdW1lbnRDbGljazsgX2kgPCBkb2N1bWVudENsaWNrXzEubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgaGFuZGxlciA9IGRvY3VtZW50Q2xpY2tfMVtfaV07XG4gICAgICAgICAgICBoYW5kbGVyKGUpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIHJlc2l6ZV8xID0gZXhwb3J0cy5yZXNpemU7IF9pIDwgcmVzaXplXzEubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgaGFuZGxlciA9IHJlc2l6ZV8xW19pXTtcbiAgICAgICAgICAgIGhhbmRsZXIoZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICAkKHdpbmRvdykub24oJ3Njcm9sbCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmIChlLnRhcmdldCA9PT0gZG9jdW1lbnQpIHtcbiAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgdmlld3BvcnRTY3JvbGxfMSA9IGV4cG9ydHMudmlld3BvcnRTY3JvbGw7IF9pIDwgdmlld3BvcnRTY3JvbGxfMS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgaGFuZGxlciA9IHZpZXdwb3J0U2Nyb2xsXzFbX2ldO1xuICAgICAgICAgICAgICAgIGhhbmRsZXIoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xudmFyIE9ic2VydmFibGVTdGF0ZV8xID0gcmVxdWlyZShcIi4vT2JzZXJ2YWJsZVN0YXRlXCIpO1xudmFyIHNlbGVjdG9ycyA9IHJlcXVpcmUoXCIuL1NlbGVjdG9yc1wiKTtcbnZhciBldmVudHMgPSByZXF1aXJlKFwiLi9FdmVudHNcIik7XG52YXIgZG9tVXRpbHMgPSByZXF1aXJlKFwiLi9Eb21VdGlsc1wiKTtcbnZhciBkcmF3ZXIgPSByZXF1aXJlKFwiLi9EcmF3ZXJcIik7XG52YXIgX3N0YXRlcyA9IHtcbiAgICBoYW1idXJnZXJTaG93bjogbmV3IE9ic2VydmFibGVTdGF0ZV8xLk9ic2VydmFibGVTdGF0ZShmYWxzZSksXG4gICAgbmF2aWdhdGlvbkV4cGFuZGVkOiBuZXcgT2JzZXJ2YWJsZVN0YXRlXzEuT2JzZXJ2YWJsZVN0YXRlKGZhbHNlKVxufTtcbnZhciBfZG9tID0ge1xuICAgIGhhbWJ1cmdlcjogJCgnPGEgY2xhc3M9XCJfZEZyYW1lVGhlbWUtaGFtYnVyZ2VyXCIgaWQ9XCJfZEZyYW1lLWhhbWJ1cmdlclwiPjxzcGFuIGNsYXNzPVwiX2RGcmFtZVRoZW1lLWhhbWJ1cmdlckljb25cIi8+PC9hPicpLFxuICAgIG5hdmlnYXRpb246ICQoJyNfZEZyYW1lLW5hdmlnYXRpb24nKSxcbiAgICBuYXZpZ2F0aW9uRHJhd2VyQ29udGFpbmVyOiAkKCc8ZGl2IGlkPVwiX2RGcmFtZS1uYXZpZ2F0aW9uRHJhd2VyQ29udGFpbmVyXCI+PGRpdiBpZD1cIl9kRnJhbWUtbmF2aWdhdGlvbkRyYXdlckJhY2tncm91bmRcIiBjbGFzcz1cIl9kRnJhbWVUaGVtZS1uYXZpZ2F0aW9uRHJhd2VyQmFja2dyb3VuZFwiPjwvZGl2PjwvZGl2PicpLFxuICAgIG5hdmlnYXRpb25EcmF3ZXI6ICQoJzxkaXYgY2xhc3M9XCJfZEZyYW1lVGhlbWUtbmF2aWdhdGlvbkRyYXdlclwiIGlkPVwiX2RGcmFtZS1uYXZpZ2F0aW9uRHJhd2VyXCI+PC9kaXY+JyksXG4gICAgZHJhd2VyU3BhY2VyOiAkKCc8ZGl2IGNsYXNzPVwiX2RGcmFtZS1uYXZEcmF3ZXJTcGFjZXJcIj48L2Rpdj4nKVxufTtcbl9kb20uaGFtYnVyZ2VyLmluc2VydEFmdGVyKF9kb20ubmF2aWdhdGlvbik7XG5fZG9tLm5hdmlnYXRpb25EcmF3ZXJDb250YWluZXIuYXBwZW5kVG8oc2VsZWN0b3JzLmhlYWRlcik7XG5fZG9tLm5hdmlnYXRpb25EcmF3ZXJDb250YWluZXIuYXBwZW5kKF9kb20ubmF2aWdhdGlvbkRyYXdlcik7XG5fZG9tLm5hdmlnYXRpb25EcmF3ZXJDb250YWluZXIuY2xpY2soZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICBfc3RhdGVzLm5hdmlnYXRpb25FeHBhbmRlZC5zZXQoZmFsc2UpO1xufSk7XG5ldmVudHMuZG9jdW1lbnRDbGljay5wdXNoKGZ1bmN0aW9uICgpIHsgcmV0dXJuIF9zdGF0ZXMubmF2aWdhdGlvbkV4cGFuZGVkLnNldChmYWxzZSk7IH0pO1xuX2RvbS5uYXZpZ2F0aW9uRHJhd2VyLmNsaWNrKGZ1bmN0aW9uIChldmVudCkge1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xufSk7XG5fZG9tLmhhbWJ1cmdlci5jbGljayhmdW5jdGlvbiAoZSkge1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGV4cGFuZE5hdmlnYXRpb24oX2RvbS5uYXZpZ2F0aW9uKTtcbn0pO1xuZXZlbnRzLnJlc2l6ZS5wdXNoKGZ1bmN0aW9uICgpIHsgcmV0dXJuIHVwZGF0ZU5hdmlnYXRpb24oKTsgfSk7XG5fc3RhdGVzLmhhbWJ1cmdlclNob3duLm9uQ2hhbmdlKGZ1bmN0aW9uIChzKSB7XG4gICAgaWYgKF9zdGF0ZXMuaGFtYnVyZ2VyU2hvd24uY3VycmVudCgpKSB7XG4gICAgICAgIHNlbGVjdG9ycy5yb290LmFkZENsYXNzKCdfZEZyYW1lU3RhdGUtaGFtYnVyZ2VyJyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBzZWxlY3RvcnMucm9vdC5yZW1vdmVDbGFzcygnX2RGcmFtZVN0YXRlLWhhbWJ1cmdlcicpO1xuICAgIH1cbiAgICBfc3RhdGVzLm5hdmlnYXRpb25FeHBhbmRlZC5zZXQoZmFsc2UpO1xufSk7XG5fc3RhdGVzLm5hdmlnYXRpb25FeHBhbmRlZC5vbkNoYW5nZShmdW5jdGlvbiAoKSB7XG4gICAgaWYgKF9zdGF0ZXMubmF2aWdhdGlvbkV4cGFuZGVkLmN1cnJlbnQoKSkge1xuICAgICAgICBzZWxlY3RvcnMucm9vdC5hZGRDbGFzcygnX2RGcmFtZVN0YXRlLW5hdmlnYXRpb25FeHBhbmRlZCcpO1xuICAgICAgICBkcmF3ZXIuY2xvc2VEcmF3ZXIoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHNlbGVjdG9ycy5yb290LnJlbW92ZUNsYXNzKCdfZEZyYW1lU3RhdGUtbmF2aWdhdGlvbkV4cGFuZGVkJyk7XG4gICAgICAgICQoJy5fZEZyYW1lLW5hdkxpbmsuX2RGcmFtZS1uYXZPcGVuZWQnKS5yZW1vdmVDbGFzcygnX2RGcmFtZS1uYXZPcGVuZWQnKTtcbiAgICB9XG4gICAgY29uc29sZS5sb2coJ05hdmlnYXRpb24gZXhwYW5kZWQvY29sbGFwc2VkJyk7XG59KTtcbiQoJy5fZEZyYW1lLW5hdkxpbmsgPiBhJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAobmF2aWdhdGUoJChlLnRhcmdldCkpKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9XG59KTtcbnVwZGF0ZU5hdmlnYXRpb24oKTtcbmZ1bmN0aW9uIHVwZGF0ZU5hdmlnYXRpb24oKSB7XG4gICAgdmFyIG92ZXJsYXBzID0gZmFsc2U7XG4gICAgX2RvbS5uYXZpZ2F0aW9uLnNpYmxpbmdzKCc6bm90KCNfZEZyYW1lLWhhbWJ1cmdlciknKS5lYWNoKGZ1bmN0aW9uIChpZHgsIGVsZW0pIHtcbiAgICAgICAgaWYgKGRvbVV0aWxzLmRvT3ZlcmxhcChfZG9tLm5hdmlnYXRpb24sICQoZWxlbSkpKSB7XG4gICAgICAgICAgICBvdmVybGFwcyA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAob3ZlcmxhcHMgfHwgKCQod2luZG93KS53aWR0aCgpIHx8IDApIDwgNjAwKSB7XG4gICAgICAgIF9zdGF0ZXMuaGFtYnVyZ2VyU2hvd24uc2V0KHRydWUpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgX3N0YXRlcy5oYW1idXJnZXJTaG93bi5zZXQoZmFsc2UpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHVwZGF0ZVNwYWNlcigpIHtcbiAgICB2YXIgaGVpZ2h0O1xuICAgIHZhciAkY3VycmVudFBhZ2UgPSBfZG9tLm5hdmlnYXRpb25EcmF3ZXIuZmluZCgnLl9kRnJhbWUtbmF2UGFnZS5fZEZyYW1lLW5hdkFjdGl2ZScpO1xuICAgIHZhciBoZWlnaHRMaW5rcyA9ICRjdXJyZW50UGFnZS5jaGlsZHJlbignLl9kRnJhbWUtbmF2SXRlbXMnKS5oZWlnaHQoKSB8fCAwO1xuICAgIHZhciBoZWlnaHRDb250ZW50cyA9ICRjdXJyZW50UGFnZS5jaGlsZHJlbignLl9kRnJhbWUtbmF2Q29udGVudCcpLmhlaWdodCgpIHx8IDA7XG4gICAgaWYgKGhlaWdodExpbmtzID4gaGVpZ2h0Q29udGVudHMpIHtcbiAgICAgICAgaGVpZ2h0ID0gaGVpZ2h0TGlua3M7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBoZWlnaHQgPSBoZWlnaHRDb250ZW50cztcbiAgICB9XG4gICAgX2RvbS5kcmF3ZXJTcGFjZXIuaGVpZ2h0KGhlaWdodCk7XG59XG5mdW5jdGlvbiBleHBhbmROYXZpZ2F0aW9uKCRyb290KSB7XG4gICAgLy8gVE9ETyBBZGQgLl9kRnJhbWUtbmF2UGF0aCB0byBhbGwgLl9kRnJhbWUtbmF2UGFnZSB0aGF0IGNvbnRhaW4gYSAuX2RGcmFtZS1uYXZBY3RpdmVcbiAgICBfZG9tLm5hdmlnYXRpb25EcmF3ZXIuZW1wdHkoKTtcbiAgICB2YXIgcGFnZTtcbiAgICBpZiAoJHJvb3QgPT0gX2RvbS5uYXZpZ2F0aW9uKSB7XG4gICAgICAgIHBhZ2UgPSAkKCc8ZGl2IGNsYXNzPVwiX2RGcmFtZS1uYXZQYWdlXCIvPicpO1xuICAgICAgICB2YXIgbGlua3MgPSAkcm9vdC5jaGlsZHJlbihcIi5fZEZyYW1lLW5hdkl0ZW1zXCIpLmNsb25lKHRydWUsIHRydWUpO1xuICAgICAgICBsaW5rcy5hcHBlbmRUbyhwYWdlKTtcbiAgICAgICAgLy8gVE9ETyBpZiAkcm9vdCA9PSB0aGlzLl9kb20ubmF2aWdhdGlvbiB0aGVuIGZldGNoIGZvb3RlciBhcyBjb250ZW50LCBvdGhlcndpc2UgZmV0Y2ggY29udGVudC5cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHBhZ2UgPSAkcm9vdC5jbG9uZSh0cnVlLCB0cnVlKTtcbiAgICB9XG4gICAgX2RvbS5kcmF3ZXJTcGFjZXIuYXBwZW5kVG8oX2RvbS5uYXZpZ2F0aW9uRHJhd2VyKTtcbiAgICBwYWdlLmFwcGVuZFRvKF9kb20ubmF2aWdhdGlvbkRyYXdlcik7XG4gICAgcGFnZS5hZGRDbGFzcyhcIl9kRnJhbWUtbmF2QWN0aXZlXCIpO1xuICAgIHBhZ2UuZmluZCgnLl9kRnJhbWUtbmF2UGFnZScpLmVhY2goZnVuY3Rpb24gKGlkeCwgcGFnZSkge1xuICAgICAgICB2YXIgJHBhZ2UgPSAkKHBhZ2UpO1xuICAgICAgICB2YXIgcGFyZW50ID0gJHBhZ2UucGFyZW50KCkuY2xvc2VzdCgnLl9kRnJhbWUtbmF2UGFnZScpO1xuICAgICAgICB2YXIgcGFyZW50VGl0bGUgPSBwYXJlbnQuc2libGluZ3MoJ2EnKS50ZXh0KCk7XG4gICAgICAgIGlmICgkcm9vdCA9PSBfZG9tLm5hdmlnYXRpb24gJiYgIXBhcmVudFRpdGxlKSB7XG4gICAgICAgICAgICBwYXJlbnRUaXRsZSA9ICdTdGFydCc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIXBhcmVudFRpdGxlKSB7XG4gICAgICAgICAgICBwYXJlbnRUaXRsZSA9ICRyb290LnNpYmxpbmdzKCdhJykudGV4dCgpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBsaW5rcyA9ICRwYWdlLmNoaWxkcmVuKCcuX2RGcmFtZS1uYXZJdGVtcycpO1xuICAgICAgICB2YXIgYmFja0l0ZW0gPSAkKCc8bGkgY2xhc3M9XCJfZEZyYW1lVGhlbWUtbmF2Q3J1bWJzXCIgLz4nKTtcbiAgICAgICAgdmFyIGJhY2tMaW5rID0gJCgnPGEgaHJlZj1cIiNcIj4nICsgcGFyZW50VGl0bGUgKyAnPC9hPicpO1xuICAgICAgICBiYWNrTGluay5hcHBlbmRUbyhiYWNrSXRlbSk7XG4gICAgICAgIGJhY2tJdGVtLnByZXBlbmRUbyhsaW5rcyk7XG4gICAgICAgIGJhY2tMaW5rLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgcGFyZW50LnJlbW92ZUNsYXNzKCdfZEZyYW1lLW5hdlBhdGgnKS5hZGRDbGFzcygnX2RGcmFtZS1uYXZBY3RpdmUnKTtcbiAgICAgICAgICAgICRwYWdlLnJlbW92ZUNsYXNzKCdfZEZyYW1lLW5hdkFjdGl2ZScpO1xuICAgICAgICAgICAgdXBkYXRlU3BhY2VyKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgIF9zdGF0ZXMubmF2aWdhdGlvbkV4cGFuZGVkLnNldCh0cnVlKTtcbiAgICB1cGRhdGVTcGFjZXIoKTtcbn1cbmZ1bmN0aW9uIG5hdmlnYXRlKCRsaW5rKSB7XG4gICAgdmFyICRwcmV2aW91c0xpbmsgPSAkKCcuX2RGcmFtZS1uYXZMaW5rLl9kRnJhbWUtbmF2T3BlbmVkJyk7XG4gICAgdmFyICRjdXJyZW50UGFnZSA9IF9kb20ubmF2aWdhdGlvbkRyYXdlckNvbnRhaW5lci5maW5kKCcuX2RGcmFtZS1uYXZBY3RpdmUnKTtcbiAgICB2YXIgJHN1Yk5hdiA9ICRsaW5rLnNpYmxpbmdzKCcuX2RGcmFtZS1uYXZQYWdlJyk7XG4gICAgdmFyIGhhc1N1Yk5hdiA9ICRzdWJOYXYubGVuZ3RoID4gMDtcbiAgICBjb25zb2xlLmxvZygnY2xpY2tlZCAnICsgJGxpbmsuYXR0cihcImhyZWZcIikgKyBcIiwgaGFzIHN1Ym5hdjogXCIgKyBoYXNTdWJOYXYpO1xuICAgIGlmICghaGFzU3ViTmF2KSB7XG4gICAgICAgIC8vIERvIG5vdCBpbnRlcmNlcHQuIExldCBjbGllbnQgbmF2aWdhdGUgdG8gbGluay5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoX3N0YXRlcy5uYXZpZ2F0aW9uRXhwYW5kZWQuY3VycmVudCgpICYmICRjdXJyZW50UGFnZS5oYXMoJGxpbmsuZ2V0KDApKS5sZW5ndGgpIHtcbiAgICAgICAgJHN1Yk5hdi5hZGRDbGFzcygnX2RGcmFtZS1uYXZBY3RpdmUnKTtcbiAgICAgICAgJGN1cnJlbnRQYWdlLnJlbW92ZUNsYXNzKCdfZEZyYW1lLW5hdkFjdGl2ZScpLmFkZENsYXNzKCdfZEZyYW1lLW5hdlBhdGgnKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoJHByZXZpb3VzTGluay5nZXQoMCkgPT09ICRsaW5rLnBhcmVudCgpLmdldCgwKSkge1xuICAgICAgICBfc3RhdGVzLm5hdmlnYXRpb25FeHBhbmRlZC5zZXQoZmFsc2UpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZXhwYW5kTmF2aWdhdGlvbigkc3ViTmF2KTtcbiAgICAgICAgJGN1cnJlbnRQYWdlLnJlbW92ZUNsYXNzKCdfZEZyYW1lLW5hdkFjdGl2ZScpO1xuICAgICAgICAkcHJldmlvdXNMaW5rLnJlbW92ZUNsYXNzKCdfZEZyYW1lLW5hdk9wZW5lZCcpO1xuICAgICAgICAkbGluay5wYXJlbnQoKS5hZGRDbGFzcygnX2RGcmFtZS1uYXZPcGVuZWQnKTtcbiAgICAgICAgJGxpbmsuY2xvc2VzdCgnLl9kRnJhbWUtbmF2QWN0aXZlJykucmVtb3ZlQ2xhc3MoJ19kRnJhbWUtbmF2QWN0aXZlJykuYWRkQ2xhc3MoJ19kRnJhbWUtbmF2UGF0aCcpO1xuICAgIH1cbiAgICB1cGRhdGVTcGFjZXIoKTtcbiAgICByZXR1cm4gdHJ1ZTtcbn1cbmV4cG9ydHMubmF2aWdhdGUgPSBuYXZpZ2F0ZTtcbmZ1bmN0aW9uIGNsb3NlTmF2aWdhdGlvbkRyYXdlcigpIHtcbiAgICBfc3RhdGVzLm5hdmlnYXRpb25FeHBhbmRlZC5zZXQoZmFsc2UpO1xufVxuZXhwb3J0cy5jbG9zZU5hdmlnYXRpb25EcmF3ZXIgPSBjbG9zZU5hdmlnYXRpb25EcmF3ZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vLyA8cmVmZXJlY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvaW5kZXguZC50c1wiLz5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG52YXIgT2JzZXJ2YWJsZVN0YXRlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIE9ic2VydmFibGVTdGF0ZShpbml0aWFsVmFsdWUpIHtcbiAgICAgICAgdGhpcy5faGFuZGxlcnMgPSBbXTtcbiAgICAgICAgdGhpcy5fY3VycmVudCA9IGluaXRpYWxWYWx1ZTtcbiAgICAgICAgdGhpcy5fZGVmYXVsdCA9IGluaXRpYWxWYWx1ZTtcbiAgICB9XG4gICAgT2JzZXJ2YWJsZVN0YXRlLnByb3RvdHlwZS5jdXJyZW50ID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5fY3VycmVudDsgfTtcbiAgICBPYnNlcnZhYmxlU3RhdGUucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICBpZiAodGhpcy5fY3VycmVudCAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnQgPSB2YWx1ZTtcbiAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLl9oYW5kbGVyczsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgaGFuZGxlciA9IF9hW19pXTtcbiAgICAgICAgICAgICAgICBoYW5kbGVyKHRoaXMuX2N1cnJlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICBPYnNlcnZhYmxlU3RhdGUucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9jdXJyZW50ID0gdGhpcy5fZGVmYXVsdDtcbiAgICB9O1xuICAgIE9ic2VydmFibGVTdGF0ZS5wcm90b3R5cGUub25DaGFuZ2UgPSBmdW5jdGlvbiAoaGFuZGxlcikge1xuICAgICAgICB0aGlzLl9oYW5kbGVycy5wdXNoKGhhbmRsZXIpO1xuICAgIH07XG4gICAgcmV0dXJuIE9ic2VydmFibGVTdGF0ZTtcbn0oKSk7XG5leHBvcnRzLk9ic2VydmFibGVTdGF0ZSA9IE9ic2VydmFibGVTdGF0ZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHMucm9vdCA9ICQoJyNfZEZyYW1lJyk7XG5leHBvcnRzLnBhZ2VOYW1lV3JhcCA9ICQoJyNfZEZyYW1lLXBhZ2VOYW1lV3JhcCcpO1xuZXhwb3J0cy5wYWdlTmFtZSA9ICQoJyNfZEZyYW1lLXBhZ2VOYW1lJyk7XG5leHBvcnRzLmhlYWRlciA9ICQoJyNfZEZyYW1lLWhlYWRlcicpO1xuZXhwb3J0cy5oZWFkZXJDb250ZW50ID0gJCgnI19kRnJhbWUtaGVhZGVyQ29udGVudCcpO1xuZXhwb3J0cy5hY3Rpb25zID0gJCgnI19kRnJhbWUtYWN0aW9ucycpO1xuZXhwb3J0cy5yaWJib24gPSAkKCcjX2RGcmFtZS1yaWJib24nKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuZnVuY3Rpb24gX19leHBvcnQobSkge1xuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKCFleHBvcnRzLmhhc093blByb3BlcnR5KHApKSBleHBvcnRzW3BdID0gbVtwXTtcbn1cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG4vLy8gPHJlZmVyZWNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL2luZGV4LmQudHNcIi8+XG52YXIgT2JzZXJ2YWJsZVN0YXRlXzEgPSByZXF1aXJlKFwiLi9PYnNlcnZhYmxlU3RhdGVcIik7XG52YXIgc2VsZWN0b3JzID0gcmVxdWlyZShcIi4vU2VsZWN0b3JzXCIpO1xudmFyIGV2ZW50cyA9IHJlcXVpcmUoXCIuL0V2ZW50c1wiKTtcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL05hdmlnYXRpb25cIikpO1xuX19leHBvcnQocmVxdWlyZShcIi4vRHJhd2VyXCIpKTtcbnZhciBfc3RhdGVzID0ge1xuICAgIGhhbWJ1cmdlclNob3duOiBuZXcgT2JzZXJ2YWJsZVN0YXRlXzEuT2JzZXJ2YWJsZVN0YXRlKGZhbHNlKVxufTtcbnZhciBfaGVhZGVySGVpZ2h0ID0gc2VsZWN0b3JzLmhlYWRlci5oZWlnaHQoKSB8fCAwO1xudmFyIF9zY3JvbGxTdGF0ZSA9IHtcbiAgICBhbmNob3I6IDAsXG4gICAgc3RhdGU6ICd1cCdcbn07XG4vLyBTcGFjZXIgYmVoaW5kIGhlYWRlciB0byBwdXNoIGNvbnRlbnQgZG93blxuJCgnPGRpdi8+JykuaGVpZ2h0KF9oZWFkZXJIZWlnaHQpLmluc2VydEFmdGVyKHNlbGVjdG9ycy5oZWFkZXIpO1xuc2VsZWN0b3JzLmhlYWRlci5jc3MoJ3Bvc2l0aW9uJywgJ2ZpeGVkJyk7XG5ldmVudHMudmlld3BvcnRTY3JvbGwucHVzaChmdW5jdGlvbiAoZSkge1xuICAgIHVwZGF0ZVNjcm9sbFN0YXRlKCk7XG59KTtcbnVwZGF0ZVNjcm9sbFN0YXRlKCk7XG5mdW5jdGlvbiB1cGRhdGVTY3JvbGxTdGF0ZSgpIHtcbiAgICB2YXIgY3VycmVudCA9ICQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpIHx8IDA7XG4gICAgdmFyIGRlbHRhID0gY3VycmVudCAtIF9zY3JvbGxTdGF0ZS5hbmNob3I7XG4gICAgaWYgKGN1cnJlbnQgPiBfaGVhZGVySGVpZ2h0ICYmIGRlbHRhID4gNTAgJiYgX3Njcm9sbFN0YXRlLnN0YXRlID09PSAndXAnKSB7XG4gICAgICAgIHNlbGVjdG9ycy5yb290LmFkZENsYXNzKCdfZWZ3U3RhdGUtc2Nyb2xsZWREb3duJyk7XG4gICAgICAgIF9zY3JvbGxTdGF0ZS5zdGF0ZSA9ICdkb3duJztcbiAgICAgICAgX3Njcm9sbFN0YXRlLmFuY2hvciA9ICQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpIHx8IDA7XG4gICAgICAgIHNlbGVjdG9ycy5yaWJib24uY3NzKHsgJ21hcmdpbi10b3AnOiAnLScgKyBzZWxlY3RvcnMucmliYm9uLmhlaWdodCgpICsgJ3B4JyB9KTtcbiAgICB9XG4gICAgZWxzZSBpZiAoKGN1cnJlbnQgPCBfaGVhZGVySGVpZ2h0IHx8IGRlbHRhIDwgLTEwMCkgJiYgX3Njcm9sbFN0YXRlLnN0YXRlID09PSAnZG93bicpIHtcbiAgICAgICAgc2VsZWN0b3JzLnJvb3QucmVtb3ZlQ2xhc3MoJ19lZndTdGF0ZS1zY3JvbGxlZERvd24nKTtcbiAgICAgICAgX3Njcm9sbFN0YXRlLnN0YXRlID0gJ3VwJztcbiAgICAgICAgX3Njcm9sbFN0YXRlLmFuY2hvciA9ICQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpIHx8IDA7XG4gICAgICAgIHNlbGVjdG9ycy5yaWJib24uY3NzKHsgJ21hcmdpbi10b3AnOiAnJyB9KTtcbiAgICB9XG4gICAgaWYgKGRlbHRhID4gMCAmJiBfc2Nyb2xsU3RhdGUuc3RhdGUgPT09ICdkb3duJyB8fCBkZWx0YSA8IDAgJiYgX3Njcm9sbFN0YXRlLnN0YXRlID09PSAndXAnKSB7XG4gICAgICAgIF9zY3JvbGxTdGF0ZS5hbmNob3IgPSAkKGRvY3VtZW50KS5zY3JvbGxUb3AoKSB8fCAwO1xuICAgIH1cbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbnZhciAkZEZyYW1lID0gcmVxdWlyZShcIi4vZEZyYW1lXCIpO1xudmFyIGNhcnRQYWdlID0gJCgnPGRpdj5IZXkhPC9kaXY+Jyk7XG4kKCcjanNPcGVuQ2FydCcpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAkZEZyYW1lLm9wZW5EcmF3ZXIoY2FydFBhZ2UpO1xufSk7XG4iXX0=
