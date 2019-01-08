/// <referece path="../../typings/index.d.ts"/>
import {ObservableState} from './ObservableState'
import * as selectors from './Selectors'
import * as events from './Events'
import * as domUtils from './DomUtils'
import * as navigation from './Navigation'
import * as drawer from './Drawer'

export const closeNavigationDrawer = navigation.closeNavigationDrawer;
export const navigate = navigation.navigate;
export const closeDrawer = drawer.closeDrawer;
export const openDrawer = drawer.openDrawer;
export const toggleDrawer = drawer.toggleDrawer;
export const refreshDrawer = drawer.refreshDrawer;

var _states = {
    hamburgerShown: new ObservableState(false)
};


var _headerHeight : number;
var _ribbonHeight : number;
var _scrollState = {
    anchor: 0,
    state: 'up'
};

selectors.header.style.position = 'fixed';

// Spacer behind header to push content down
var spacer = document.createElement('div');
spacer.id = '_dFrame-headerSpacer';
selectors.header.insertAdjacentElement('afterend', spacer);
updateSpacer();

events.resize.push((e) => {
    updateSpacer();
});

events.viewportScroll.push((e) => {
    updateScrollState();
});

updateScrollState();

function setScrollStateAnchor()
{
    _scrollState.anchor = (window.pageYOffset || 0) - _headerHeight;
}

function updateSpacer() {
    _ribbonHeight = selectors.ribbon.offsetHeight || 0;
    _headerHeight = _ribbonHeight + (selectors.headerContent.offsetHeight || 0);
    spacer.style.height = _headerHeight + 'px';
}

function updateScrollState() {
    let current = window.pageYOffset || 0;
    let delta = current - _headerHeight - _scrollState.anchor;

    if (current > _ribbonHeight && delta > 50 && _scrollState.state === 'up') {
        selectors.root.classList.add('_efwState-scrolledDown');
        _scrollState.state = 'down';
        setScrollStateAnchor();
        selectors.ribbon.style.marginTop = '-' + selectors.ribbon.offsetHeight + 'px';
    } else if ((current < _ribbonHeight || delta < -100) && _scrollState.state === 'down') {
        selectors.root.classList.remove('_efwState-scrolledDown');
        _scrollState.state = 'up';
        setScrollStateAnchor();
        selectors.ribbon.style.marginTop = '';
    }

    if (delta > 0 && _scrollState.state === 'down' || delta < 0 && _scrollState.state === 'up') {
        setScrollStateAnchor();
    }
}