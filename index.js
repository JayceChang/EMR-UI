window.config = {
  mainTitle: '等级评审系统1',
  xmtitle: '河南正达1',
  indicatorUrlTemplate: '/report.html?indicatorCode=${0}#/indicator/workbench',
};
async function modernPost(url, data) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`请求失败: ${response.status}`);
  }

  return response.json();
}

function emitWindowConfigUpdated() {
  window.dispatchEvent(new CustomEvent('window-config-updated', { detail: window.config }));
}

function applyLocalConfig() {
  let obj = window.localStorage.getItem('window_config');
  if (obj) {
    try {
      const localConfig = JSON.parse(obj);
      if (localConfig && typeof localConfig === 'object') {
        window.config = {
          ...window.config,
          ...localConfig,
        };
      }
    } catch (e) {
      console.error('解析window_config失败', e);
    }
  }
}

function updateDocumentTitle() {
  document.title = window.config && window.config.mainTitle ? window.config.mainTitle : document.title;
}

async function getxtname() {
  try {
    const res = await modernPost('/api/login/getCanShu', {});
    let yy_obj = res.data.find((x) => x.config_key == 'yy_name');
    if (yy_obj) {
      window.config.xmtitle = yy_obj.config_value;
    }
    let system_obj = res.data.find((x) => x.config_key == 'system_name');
    if (system_obj) {
      window.config.mainTitle = system_obj.config_value;
    }
    updateDocumentTitle();
    window.localStorage.setItem('window_config', JSON.stringify(window.config));
    emitWindowConfigUpdated();
  } catch (error) {
    console.error(error);
  }
}

async function initAppConfig() {
  applyLocalConfig();
  updateDocumentTitle();
  emitWindowConfigUpdated();
  await getxtname();
}

window.__appConfigReadyPromise = initAppConfig();
