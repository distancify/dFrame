import {ObservableState} from './ObservableState'
import * as selectors from './Selectors'
import * as events from './Events'
import * as domUtils from './DomUtils'
import * as _dFrame from './dFrame'
import * as drawer from './Drawer'


var _states = {
    hamburgerShown: new ObservableState(false),
    opened: new ObservableState(false)
};

var _dom = {
    hamburger: <HTMLElement>document.querySelector('#_dFrame-hamburger'),
    navigation: <HTMLElement>document.querySelector('#_dFrame-navigation'),
    navigationDrawerContainer: <HTMLElement>document.querySelector('#_dFrame-navigationDrawerContainer'),
    navigationFrame: <HTMLElement>document.querySelector('#_dFrame-navigationFrame'),
    navigationDrawer: <HTMLElement>document.querySelector('#_dFrame-navigationDrawer'),
    drawerSpacer: domUtils.createElementFromHTML('<div class="_dFrame-navDrawerSpacer"></div>'),
}

var _spacerHeight: number = 0;

var currentRoot: HTMLElement;

_dom.navigationDrawer.insertAdjacentElement('beforeend', _dom.drawerSpacer);

_dom.navigationDrawerContainer.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    _states.opened.set(false);
});
events.documentClick.push(() => _states.opened.set(false));
        
_dom.navigationDrawer.addEventListener('click', (event) => {
    event.stopPropagation();
});
        
_dom.hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    expandNavigation(_dom.navigation);
});

events.resize.push(updateNavigation);
events.resize.push(updateSpacer);
events.resize.push(updateDrawerMaxSize);
events.viewportScroll.push(updateDrawerMaxSize);

_states.hamburgerShown.onChange((s) => {
    if (_states.hamburgerShown.current()) {
        selectors.root.classList.add('_dFrameState-hamburger');
    } else {
        selectors.root.classList.remove('_dFrameState-hamburger');
    }
    _states.opened.set(false);
});
        
_states.opened.onChange(() => {
    if (_states.opened.current()) {
        selectors.root.classList.add('_dFrameState-navigationExpanded');
        drawer.closeDrawer();
    } else {
        selectors.root.classList.remove('_dFrameState-navigationExpanded');
        onClose();
    }
});

resetActiveStates();
createBackLinks();

Array.prototype.forEach.call(document.querySelectorAll('._dFrame-navLink > a'), (elem : HTMLElement) => {
    elem.addEventListener('click', (e) => {
        if (navigate(<HTMLElement>e.target)) {
            e.preventDefault();
            e.stopPropagation();
        }
    });
});

function createBackLinks() {
    Array.prototype.forEach.call(document.querySelectorAll('._dFrame-navPage'), (page : HTMLElement) => {
        var parentTitle: string;

        let parent = <HTMLElement>(<HTMLElement>page.parentElement).closest('._dFrame-navPage');

        if (parent === null) {
            parentTitle = 'Start';
        } else {
            let parentLink = parent.previousElementSibling;
            parentTitle = (<HTMLElement>parentLink).textContent || "Back";
        }

        let links = page.querySelector('._dFrame-navItems');

        if (links === null) { return; }

        let backItem = document.createElement('li');
        backItem.classList.add('_dFrame-navCrumb');
        let backLink = document.createElement('a');
        backLink.setAttribute('href', '#');
        backLink.innerText = parentTitle;
        backItem.appendChild(backLink);

        links.insertAdjacentElement('afterbegin', backItem);

        backLink.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();

            let parent = <HTMLElement>(<HTMLElement>page.parentElement).closest('._dFrame-navPage');
            parent.classList.remove('_dFrame-navPath');
            parent.classList.add('_dFrame-navActive');
            page.classList.remove('_dFrame-navActive');
            updateSpacer();
        });
    });
}

function onClose() {
    // Move navigation drawer content and links back to currentRoot
    if (currentRoot === _dom.navigation) {
        let page = <HTMLElement>_dom.navigationDrawer.querySelector('._dFrame-navPage');
        let links = <HTMLElement>page.querySelector('._dFrame-navItems');
        currentRoot.insertAdjacentElement('beforeend', links);
        page.remove();
    } else {
        currentRoot.insertAdjacentElement('beforeend', <HTMLElement>_dom.navigationDrawer.querySelector('._dFrame-navPage'));
    }

    currentRoot = document.createElement('div');

    resetActiveStates();
}

function resetActiveStates() {
    Array.prototype.forEach.call(document.querySelectorAll('._dFrame-navPage'), function (elem : HTMLElement) {
        elem.classList.remove('_dFrame-navActive');
        elem.classList.remove('_dFrame-navPath');
        if (elem.classList.contains('_dFrame-defaultActive')) {
            elem.classList.add('_dFrame-navActive');
        }
    });
}

updateNavigation();

function updateNavigation() {
    if (domUtils.isSmallDevice()) {
        _states.hamburgerShown.set(true);
    } else {
        _states.hamburgerShown.set(false);
    }
}

function updateDrawerMaxSize() {
    let viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    let headerHeight = domUtils.headerHeight();
    if (!domUtils.isSmallDevice() && _spacerHeight + headerHeight > viewportHeight) {
        _dom.navigationFrame.style.maxHeight = viewportHeight - headerHeight + "px";
    } else {
        _dom.navigationFrame.style.maxHeight = null;
    }
}

function updateSpacer() {
    let currentPage = _dom.navigationDrawer.querySelector('._dFrame-navPage._dFrame-navActive');
    if (!currentPage) { return; }

    let heightLinks = domUtils.outerHeightWithMargin(domUtils.getChildElement(currentPage, '._dFrame-navItems'));
    let heightContents = domUtils.outerHeightWithMargin(domUtils.getChildElement(currentPage, '._dFrame-navContent'));

    _spacerHeight = Math.max(heightLinks, heightContents);

    _dom.drawerSpacer.style.height = _spacerHeight + 'px';
    updateDrawerMaxSize();
}

function expandNavigation(root : HTMLElement) {
    if (_states.opened.current()) {
        onClose();
    }

    currentRoot = root;
    let currentLink = currentRoot.querySelector('._dFrame-navCurrent');
    var page : HTMLElement | null;

    if (currentRoot == _dom.navigation) {
        page = domUtils.createElementFromHTML('<div class="_dFrame-navPage"/>');
        let links = currentRoot.querySelector("._dFrame-navItems");

        if (links) {
            page.insertAdjacentElement('beforeend', links);
        }
    } else {
        page = currentRoot.querySelector('._dFrame-navPage');
    }

    if (!page) { return; }

    _dom.navigationDrawer.insertAdjacentElement('beforeend', page);

    if (currentLink) {
        let activePage = currentLink.closest('._dFrame-navPage');
        if (activePage) {
            activePage.classList.add('_dFrame-navActive');
            let parent = activePage.parentElement;
            while (parent) {
                let page = parent.closest('._dFrame-navPage');
                if (page) {
                    page.classList.add('_dFrame-navPath');
                    parent = page.parentElement;
                } else {
                    parent = null;
                }
            }
        }
    } else {
        page.classList.add('_dFrame-navActive');
    }

    _states.opened.set(true);
    updateSpacer();
}

export function navigate(link : HTMLElement) {
    
    let previousLink = <HTMLElement>document.querySelector('._dFrame-navLink._dFrame-navOpened');
    let currentPage = <HTMLElement>_dom.navigationDrawerContainer.querySelector('._dFrame-navActive');
    let root = <HTMLElement>link.parentElement;

    if (root === currentRoot) {
        _states.opened.set(false);
        return true;
    }

    let subNav = <HTMLElement>root.querySelector('._dFrame-navPage');
    let hasSubNav = subNav && subNav.querySelector('._dFrame-navLink') !== null;
    
    if (!hasSubNav) {
        // Do not intercept. Let client navigate to link.
        return false;
    }
    
    if (_states.opened.current() && link.closest('._dFrame-navPage') === currentPage) {
        // Click on link on currently opened page
        subNav.classList.add('_dFrame-navActive');
        currentPage.classList.remove('_dFrame-navActive')
        currentPage.classList.add('_dFrame-navPath');
        updateSpacer();
    } else if (previousLink === link.parentElement) {
        _states.opened.set(false);
    } else {
        // Expand drawer with current link as context
        expandNavigation(root);
    }
    
    return true;
}

export function closeNavigationDrawer() {
    _states.opened.set(false);
}

export function getContainerHeight() {
    if (domUtils.isSmallDevice()) {
        return 0;
    }
    return _dom.navigationDrawerContainer.offsetHeight || 0;
}
