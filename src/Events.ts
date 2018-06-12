
export const resize: { (event: Event): void }[] = [];
export const viewportScroll: { (event: Event): void }[] = [];
export const documentClick: { (event: Event): void }[] = [];

document.addEventListener('click', (e : Event) => {
    for (let handler of documentClick) {
        handler(e);
    }
});

window.addEventListener('resize', (e : Event) => {
    for (let handler of resize) {
        handler(e);
    }
});

window.addEventListener('scroll', (e : Event) => {
    if (e.target === document) {
        for (let handler of viewportScroll) {
            handler(e);
        }
    }
});
