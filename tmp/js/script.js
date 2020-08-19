$(() => {
    var noSleep = new NoSleep();
    noSleep.enable();
    const socket = io();
    // ===============================================================
    socket.on(`flip-card`, (character) => {
        const player = $(`.card`);

        ( character === `VILLAGER` ) && $(`.chatbox`).hide();
        ( character !== `VILLAGER` ) && $(`.chatbox`).show();
        player.find(`svg`).find(`g`).removeClass(`show`);
        player.find(`svg`).find(`g[id="${character}"]`).addClass(`show`);
    });
    socket.on(`player-join`, (player) => {
        $(`.card`).attr(`data-id`, player.id);
        $(`.card`).attr(`data-name`, player.name);
        $(`.card`).find(`.name`).text(player.name);
    });
    socket.on(`restart-game-player`, (player) => {
        $(`.chatbox`).find(`.item`).remove();
    });
    // ===============================================================
    $(`.btn-click-start`).on(`click`, () => {
        const name = $(`.name`).val();
        socket.emit('join-room', name);
        $(`.form`).remove();
        $(`.card`).removeClass(`hidden`);
    });
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

        socket.emit(`chat-from-client-to-server`, content);
        $(`.chatbox .inputchat input`).val(``).focus();
    });
    socket.on(`chat-from-server-to-client`, (data) => {
        const pane = $(`.chatbox .content .tab-pane`);
        pane.find(`.over`)
            .append(`<div class="item">
                    <span class="name">${data.name}</span>  
                    <span class="cont">${data.content}</span>  
                </div>`)
            .animate({scrollTop: pane.find(`.over`).prop("scrollHeight")}, 1);
    });
});
