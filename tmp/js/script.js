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
    socket.on(`flip-card`, (character) => {
        const member = $(`.card`);

        member.find(`svg`).find(`g`).removeClass(`show`);
        member.find(`svg`).find(`g[id="${character}"]`).addClass(`show`);
    });
    socket.on(`member-join`, (member) => {
        $(`.card`).attr(`data-id`, member.id);
    });
    // ===============================================================
    $(`.card`).find(`g:not(#BG)`).each((index, element) => {
        $(element).find(`path`).each((ind, ele) => {
            const length = $(ele)[0].getTotalLength();
            $(ele).css({
                'stroke-dasharray': `${length}, ${length}`,
                'stroke-dashoffset': length,
            });
        });
    });
});
