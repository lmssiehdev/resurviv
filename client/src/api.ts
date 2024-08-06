export const api = {
    resolveUrl: function (url: string) {
        return new URL(url, "http://74.208.224.33:3000");
    },
    resolveRoomHost: function () {
        return window.location.host;
    }
};
