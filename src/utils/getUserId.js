const getUserId = () => {
    if (window.Telegram && window.Telegram.WebApp) {
        const tgWebAppUser = window.Telegram.WebApp.initDataUnsafe.user;
        if (tgWebAppUser && tgWebAppUser.id) {
            return tgWebAppUser.id;
        }
    }
    const urlParams = new URLSearchParams(window.location.search);
    const idFromUrl = urlParams.get('id');
    if (idFromUrl) {
        return idFromUrl;
    }
    // Если ID не найден ни в Telegram, ни в URL
    return import.meta.env.DEV ? 85047452 : null;
};
export default getUserId