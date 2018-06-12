import * as selectors from './Selectors'

export function createElementFromHTML(html : string) : HTMLElement {
    var div = document.createElement('div');
    div.innerHTML = html.trim();

    return <HTMLElement>div.firstChild; 
  }

export function outerHeightWithMargin(element : HTMLElement | null) {
    if (!element) { return 0; }

    var height = element.offsetHeight;
    var style = getComputedStyle(element);
  
    height += parseInt(style.marginTop || "0") + parseInt(style.marginBottom || "0");
    return height;
  }

export function headerHeight() {
    let result = selectors.headerContent.offsetHeight || 0;
    if (!document.querySelector('._efwState-scrolledDown')) {
        result += selectors.ribbon.offsetHeight || 0;
    }
    return result;
}

export function isSmallDevice() {
    return Math.max(document.documentElement.clientWidth, window.innerWidth || 0) < 768;
}

export function getChildElement(element : Element, selector : string) {
    
    var children = element.childNodes;
    for(var i = 0, l=children.length; i<l; ++i) {
        var child = children[i];
        if(child.nodeType === 1 && (<Element>child).matches(selector)) {
            return <HTMLElement>child;
        }
    }
    return null;
}

if (typeof Element.prototype.matches !== 'function') {
    Element.prototype.matches = Element.prototype.msMatchesSelector || (<any>Element.prototype).mozMatchesSelector || Element.prototype.webkitMatchesSelector;
    if (!Element.prototype.matches)
    {
        Element.prototype.matches = function matches(selector) {
            var element = this;
            var elements = document.querySelectorAll(selector);
            var index = 0;

            while (elements[index] && elements[index] !== element) {
                ++index;
            }

            return Boolean(elements[index]);
        };
    }
}

if (typeof Element.prototype.closest !== 'function') {
    Element.prototype.closest = function closest(selector : string) {
        var element = this;

        while (element && element.nodeType === 1) {
            if (element.matches(selector)) {
                return element;
            }

            element = <HTMLElement>element.parentNode;
        }

        return null;
    };
}

