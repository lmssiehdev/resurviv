export const api = {
    resolveUrl: function(url) {
        return `https://feat-team-menu.fly.dev${url}`;
    },
    resolveRoomHost: function() {
        return `https://feat-team-menu.fly.dev` ?? window.location.host;
    }
};
