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
        const player = $(`.card`);

        player.find(`svg`).find(`g`).removeClass(`show`);
        player.find(`svg`).find(`g[id="${character}"]`).addClass(`show`);
    });
    socket.on(`player-join`, (player) => {
        $(`.card`).attr(`data-id`, player.id);
        $(`.card`).attr(`data-name`, player.name);
        $(`.card`).find(`.name`).text(player.name);
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
    // ===============================================================
    $(`html`).on(`click`, `.chatbox .toggle` , (event) => {
        const isToggle = $(`.chatbox`).hasClass(`show`);

        (!isToggle) && $(`.chatbox`).addClass(`show`);
        (isToggle) && $(`.chatbox`).removeClass(`show`);
    });
    $(`html`).on(`click`, `.chatbox .inputchat button` , (event) => {
        const content = $(`.chatbox .inputchat input`).val();
        const name = $(`.card`).data(`name`);
        const pane = $(`.chatbox .content .tab-pane`);

        pane.find(`.over`).append(`<div class="item">
                                    <span class="name">${name}</span>  
                                    <span class="cont">${content}</span>  
                                </div>`);
        
        socket.emit(`chat-from-client`, content);
        $(`.chatbox .inputchat input`).val(``);
    });
    socket.on(`chat-request-from-server`, (content) => {
        const pane = $(`.chatbox .content .tab-pane`);
        pane.find(`.over`).append(`<div class="item">
                                    <span class="name">Lawer</span>  
                                    <span class="cont">${content}</span>  
                                </div>`);
    });
});
