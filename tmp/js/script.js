$(() => {
    var noSleep = new NoSleep();
    noSleep.enable();
    const socket = io();
    // ===============================================================
    $(`.btn-click-start`).on(`click`, () => {
        const name = $(`.name`).val();
        socket.emit('join-room', name);
        $(`.form`).remove();
        $(`.card`).removeClass(`hidden`);
    });
    socket.on(`start-game`, (character) => {
        const member = $(`.card`);
            
        member.find(`svg`).find(`g`).removeClass(`show`);
        member.find(`svg`).find(`g[id="${character}"]`).addClass(`show`);
    });
    // ===============================================================
    $(`.card`).find(`g:not(#BG):not(#DIE)`).each((index, element) => {
        $(element).find(`path`).each((ind, ele) => {
            const length = $(ele)[0].getTotalLength();
            $(ele).css({
                'stroke-dasharray': `${length}, ${length}`,
                'stroke-dashoffset': length,
            });
        });
    });
});
