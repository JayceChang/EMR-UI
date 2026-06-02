import { localRead, localSave, localRemove } from '/@/utils/local-util.js';
import LocalStorageKeyConst from '/@/constants/local-storage-key-const.js';

const CHANNEL_TOKEN_QUERY_KEY = 'channelToken';

const emitChannelLoginUpdated = () => {
  window.dispatchEvent(
    new CustomEvent('channel-login-updated', {
      detail: {
        channelLoginFlag: isChannelLogin(),
        channelReturnUrl: getChannelReturnUrl() || '',
      },
    })
  );
};

export const getChannelTokenFromUrl = () => {
  const params = new URLSearchParams(window.location.search || '');
  return params.get(CHANNEL_TOKEN_QUERY_KEY) || '';
};

export const saveChannelToken = (channelToken) => {
  if (!channelToken) {
    return;
  }
  localSave(LocalStorageKeyConst.CHANNEL_TOKEN, channelToken);
  localSave(LocalStorageKeyConst.CHANNEL_LOGIN_FLAG, '1');
  emitChannelLoginUpdated();
};

export const saveChannelReturnUrl = (returnUrl) => {
  if (!returnUrl) {
    localRemove(LocalStorageKeyConst.CHANNEL_RETURN_URL);
    emitChannelLoginUpdated();
    return;
  }
  localSave(LocalStorageKeyConst.CHANNEL_RETURN_URL, returnUrl);
  emitChannelLoginUpdated();
};

export const getChannelReturnUrl = () => {
  return localRead(LocalStorageKeyConst.CHANNEL_RETURN_URL);
};

export const buildChannelAuthErrorUrl = (option = {}) => {
  const reason = option.reason || 'expired';
  const returnUrl = option.returnUrl || getChannelReturnUrl();

  const params = new URLSearchParams();
  params.set('reason', reason);
  if (reason !== 'invalid' && returnUrl) {
    params.set('returnUrl', returnUrl);
  }

  const query = params.toString();
  return `/#/channel-auth-error${query ? `?${query}` : ''}`;
};

export const getSavedChannelToken = () => {
  return localRead(LocalStorageKeyConst.CHANNEL_TOKEN);
};

export const getEffectiveChannelToken = () => {
  return getChannelTokenFromUrl() || getSavedChannelToken();
};

export const isChannelLogin = () => {
  return localRead(LocalStorageKeyConst.CHANNEL_LOGIN_FLAG) === '1' && !!getSavedChannelToken();
};

export const clearChannelLogin = (option = {}) => {
  localRemove(LocalStorageKeyConst.CHANNEL_TOKEN);
  localRemove(LocalStorageKeyConst.CHANNEL_LOGIN_FLAG);
  if (!option.keepReturnUrl) {
    localRemove(LocalStorageKeyConst.CHANNEL_RETURN_URL);
  }
  emitChannelLoginUpdated();
};

export const clearChannelTokenInUrl = () => {
  const url = new URL(window.location.href);
  if (!url.searchParams.has(CHANNEL_TOKEN_QUERY_KEY)) {
    return;
  }
  url.searchParams.delete(CHANNEL_TOKEN_QUERY_KEY);
  const search = url.searchParams.toString();
  const newUrl = `${url.pathname}${search ? `?${search}` : ''}${url.hash}`;
  window.history.replaceState({}, '', newUrl);
};
