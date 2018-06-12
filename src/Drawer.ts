import {ObservableState} from './ObservableState'
import * as selectors from './Selectors'
import * as events from './Events'
import * as domUtils from './DomUtils'
import * as navigation from './Navigation'

var _states = {
    opened: new ObservableState(false),
    page: new ObservableState<HTMLElement>(document.createElement('div'))
};

var _dom = {
    drawerContainer: <HTMLElement>document.querySelector('#_dFrame-drawerContainer'),
    frame: <HTMLElement>document.querySelector('#_dFrame-drawerFrame'),
    drawer: <HTMLElement>document.querySelector('#_dFrame-drawer'),
    crumble: document.createElement('div')
};

_dom.drawerContainer.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    _states.opened.set(false);
});
_dom.drawer.addEventListener('click', (event) => {
    event.stopPropagation();
});
events.documentClick.push(() => _states.opened.set(false));

events.resize.push(updateDrawerMaxSize);
events.viewportScroll.push(updateDrawerMaxSize);

_states.opened.onChange(() => {
    if (_states.opened.current()) {
        selectors.root.classList.add('_dFrameState-drawerOpened');
        navigation.closeNavigationDrawer();
    } else {
        _states.page.reset();
        selectors.root.classList.remove('_dFrameState-drawerOpened');
    }
});

_states.page.onBeforeChange(() => {
    if (_dom.crumble.parentElement) {
        (<HTMLElement>_dom.crumble.parentElement).replaceChild(_states.page.current(), _dom.crumble)
    }
});

_states.page.onChange(() => {

    if (_states.page.isDefault()) {
        return;
    }

    let pageParent = <HTMLElement>_states.page.current().parentElement;
    if (pageParent) {
        pageParent.replaceChild(_dom.crumble, _states.page.current());
    }

    _dom.drawer.appendChild(_states.page.current());

    _states.opened.set(true);
    updateDrawerMaxSize();
});

export function openDrawer(page : HTMLElement) {
    // setTimeout is used to avoid that a click that triggered openDrawer to immediately close the drawer if the event is allowed to propagate.

    setTimeout(() => {
        _states.page.set(page);
    }, 0);
}

export function toggleDrawer(page : HTMLElement) {
    if (_states.opened.current()) {
        _states.opened.set(false);
    } else {
        openDrawer(page);
    }
}

export function closeDrawer() {
    _states.opened.set(false);
}

function updateDrawerMaxSize() {
    let contentHeight = _dom.drawer.offsetHeight || 0;
    let viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    let headerHeight = domUtils.headerHeight();
    if (!domUtils.isSmallDevice() && contentHeight + headerHeight > viewportHeight) {
        _dom.frame.style.maxHeight = viewportHeight - headerHeight + "px";
    } else {
        _dom.frame.style.maxHeight = null;
    }
}

export function getContainerHeight() {
    if (domUtils.isSmallDevice()) {
        return 0;
    }
    return _dom.drawerContainer.offsetHeight || 0;
}

export function refreshDrawer() {
    updateDrawerMaxSize();
}
